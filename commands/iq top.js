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

async function getHighscores(interaction) {
    return client.guilds.cache.get(interaction.guild.id).members.fetch().then((members) => {
        const sort = userCollection.sort((a, b) => b.iq - a.iq)
            .filter(user => members.has(user.user_id) && user.iq > 0)
            .first(10)
            .map((user, position) => `${getPositionText(position + 1)} ${members.get(user.user_id)}: **${user.iq} IQ**`)
            .join('\n');
        
        if (sort.length === 0) {
            return 'Nobody has calculated their IQ yet.\n\nType **$iq** to get started!';
        }

        return sort;
    });
}

async function getPosition(interaction, interactionUserID) {
    const cache = await client.guilds.cache.get(interaction.guild.id).members.fetch().then((members) => {
        return userCollection.sort((a, b) => b.iq - a.iq).filter(user => members.has(user.user_id) && user.iq > 0);
    });

    if (cache.size === 0) {
        return NaN;
    }

    return cache.map(function(user) { return user.user_id; }).indexOf(interactionUserID);
}

async function getNumberOfUsers(interaction) {
    const cache = await client.guilds.cache.get(interaction.guild.id).members.fetch().then((members) => {
        return userCollection.filter(user => members.has(user.user_id) && user.iq > 0);
    });

    return cache.size;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('iq-top')
        .setDescription('Display the IQ leaderboard for this server.'),
    async execute(interaction) {
        const user = interaction.user ? interaction.user : interaction.author;
        const highscores = await getHighscores(interaction);
        const position = await getPosition(interaction, user.id);
        const numberOfUsers = await getNumberOfUsers(interaction);

        const embed = new MessageEmbed() 
			.setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
			.setTitle(`${interaction.guild.name} IQ Leaderboard`)
			.setDescription(
				`${user}\nYou are rank **${numberWithCommas(position + 1)}** with an IQ of **${userCollection.get(user.id) ? userCollection.get(user.id).iq : 0}**.`,
			)
			.addFields({ name: 'Highscores', value: highscores })
            .addFields({ name: 'Statistics', value: 
                `Tracking **${numberWithCommas(numberOfUsers)}** users.` })
			.setTimestamp();

        return await interaction.reply({ embeds: [embed] });
    },
};