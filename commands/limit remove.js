const { SlashCommandBuilder } = require('@discordjs/builders');

const { allowedChannels } = require('../dbObject.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limit-remove')
        .setDescription('Removes the channel limit set by /limit-channel.'),
    async execute(interaction) {
        await allowedChannels.delete(interaction.guild.id);
        return await interaction.reply('Channel limit was removed.');
    },
};