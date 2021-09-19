const { SlashCommandBuilder } = require('@discordjs/builders');

const { allowedChannels } = require('../dbObject.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limit-channel')
        .setDescription('Limit e-bot commands to a single channel.'),
    async execute(interaction) {
        const channelID = interaction.channel.id;

        await allowedChannels.set(interaction.guild.id, channelID);

        return await interaction.reply(`Bot channel set to ${interaction.channel.id}.`);
    },
};