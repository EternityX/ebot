const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { iqCollection } = require('../dbObject.js');
const { client } = require('../client.js');

function getPositionText(position) {
    let text;

    if (position === 1) {
        text = ':first_place: ';
    }
    else if (position === 2) {
        text = ':second_place: ';
    }
    else if (position === 3) {
        text = ':third_place: ';
    }
    else {
        text = '#' + position;
    }

    return text;
}

async function getHighscores(interaction) {
    return client.guilds.cache.get(interaction.guild.id).members.fetch().then((members) => {
        const sorted = iqCollection.sort((a, b) => b.iq - a.iq)
            .filter(user => members.has(user.user_id) && user.iq > 0)
            .first(10)
            .map((user, position) => `${getPositionText(position + 1)} ${members.get(user.user_id)}: **${user.iq} IQ**`)
            .join('\n');
        
        if (sorted.length === 0) {
            return 'Nobody has calculated their IQ yet.\n\nType **$iq** to get started!';
        }

        return sorted;
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('iq-top')
        .setDescription('Show the IQ leaderboard.'),
    async execute(interaction) {
        const user = interaction.user ? interaction.user : interaction.author;
        const highscores = await getHighscores(interaction);

        const embed = new MessageEmbed() 
			.setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
			.setTitle('IQ Leaderboard')
			.setDescription(
				`${user}\nYour current highscore is: **${iqCollection.get(user.id) ? iqCollection.get(user.id).iq : 0} IQ**`,
			)
			.addFields({ name: ':trophy: Highscores', value: highscores })
			.setTimestamp();

        return await interaction.reply({ embeds: [embed] });
    },
};