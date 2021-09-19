const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { userCollection } = require('../dbObject.js');
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

async function getHighscores() {
    const sorted = userCollection.sort((a, b) => b.iq - a.iq)
            .filter(user => client.users.cache.has(user.user_id) && user.iq > 0)
            .first(10)
            .map((user, position) => `${getPositionText(position + 1)} ${client.users.cache.get(user.user_id).tag}: **${user.iq} IQ**`)
            .join('\n');
        
        if (sorted.length === 0) {
            return 'Nobody has calculated their IQ yet.\n\nType **$iq** to get started!';
        }

        return sorted;
}

async function getPosition(interactionUserID) {
    const cache = userCollection.sort((a, b) => b.iq - a.iq).filter(user => client.users.cache.has(user.user_id) && user.iq > 0);

    if (cache.length === 0) {
        return NaN;
    }

    return cache.map(function(user) { return user.user_id; }).indexOf(interactionUserID);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('iq-global')
        .setDescription('Display the global IQ leaderboard.'),
    async execute(interaction) {
        const user = interaction.user ? interaction.user : interaction.author;
        const highscores = await getHighscores();
        const position = await getPosition(user.id);

        const embed = new MessageEmbed() 
			.setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
			.setTitle('Global IQ Leaderboard')
			.setDescription(
				`${user}\nYou are rank **${position + 1}** with an IQ of **${userCollection.get(user.id) ? userCollection.get(user.id).iq : 0}**.`,
			)
			.addFields({ name: 'Highscores', value: highscores })
            .addFields({ name: 'Statistics', value: 
                `Tracking **${numberWithCommas(userCollection.size)}** users in **${numberWithCommas(client.guilds.cache.size)}** servers.` })
			.setTimestamp();

        return await interaction.reply({ embeds: [embed] });
    },
};