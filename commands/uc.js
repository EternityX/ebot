/* eslint-disable prefer-const */
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const cheerio = require('cheerio');
const axios = require('axios');

const chalk = require('chalk');
const { logConsole } = require('../util.js');

let randomThreadNumber;

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fetchThreadData = async () => {
    randomThreadNumber = randomNumber(1, 469795);

    const result = await axios
        .get('https://www.unknowncheats.me/forum/printthread.php?t=' + randomThreadNumber)
        .catch(function(error) {
            if (error.response) {
                const $ = error.response.data;

                if ($.includes('You are not logged in or you do not have permission to access this page. This could be due to one of several reasons')) {
                    logConsole(chalk.red(`Hidden thread ID ${randomThreadNumber}, searching for a new one...`));
                    return false;
                }
                else if ($.includes('Invalid Thread specified. If you followed a valid link, please notify the')) {
                    logConsole(chalk.red(`Invalid thread ID ${randomThreadNumber}, searching for a new one...`));
                    return false;
                }
            }
        });

    logConsole(chalk.bgGreen(`Found UC thread ID ${randomThreadNumber}`));
    return result.data;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uc')
        .setDescription('Displays a random UC thread.'),
    async execute(interaction) {
        let data;

        // Keep searching for threads if no valid data is not found
        while (!data) {
            data = await fetchThreadData();
        }

        const $ = cheerio.load(data);

        let threadUrl, threadAuthor, threadDate, threadTitle, threadText, sectionName;
        let hasCode = false;

        // start removing useless data

        // this is a problematic table (it's either empty or holds the page number)
        if ($('.page').children().first().is('table')) {
            $('.page').children().first().remove();
        }

        // first few divs contain site name, section name, and thread name along with links for them
        // we can find these by looking for the accesskey attribute minus the 2nd div

        // 1st div, contains the site name
        if ($('a[accesskey=1]')) {
            $('a[accesskey=1]').parent().remove();
        }

        // 2nd div, contains the section name. doesn't have an accesskey attribute
        sectionName = $('a').first().text();

        // 3rd div, contains thread title and url. we'll keep the url for later
        threadUrl = $('a[accesskey=3]').attr('href');
        if ($('a[accesskey=3]')) {
            $('a[accesskey=3]').parent().remove();
        }

        // first table is the OP, assuming we're on the first page
        if ($('table').first().hasClass('tborder')) {
            threadAuthor = $('tr[valign=bottom]').first().children().first();
            threadDate = $(threadAuthor).next();

            threadTitle = $('td').first().children('div').first();
            threadText = $(threadTitle).next();

            // console.log($(threadText).find('code').map((idx, el) => $(el).html()).toArray());

            $(threadText).find('code').map((idx, elm) => {
                $(elm).text('```c\n' + $(elm).text() + '```');
                hasCode = true;
            });
        }

        const author = $(threadAuthor).text();
        const date = $(threadDate).text();
        let title = $(threadTitle).text();
        let text = $(threadText).text();

        if (text.length >= 2000) {
            text = hasCode ? text.slice(0, 1996) + '```' : text.slice(0, 1996) + '...';
        }

        if (title.length >= 256) {
            title = title.slice(0, 252) + '...';
        }

        const embed = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
            .setAuthor(author)
            .setTitle(title)
            .setURL('https://unknowncheats.me/forum/' + threadUrl)
            .setDescription(text)
            .setFooter('Posted in ' + sectionName + ' - ' + date);

        const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('moreThread')
					.setLabel('Another one')
					.setStyle('PRIMARY'));

        await interaction.channel.send({ embeds: [embed], components: [row] }).then(msg => {
            setTimeout(() => msg.delete(), 300000);
        });
    },
};