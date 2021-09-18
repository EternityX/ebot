const { SlashCommandBuilder } = require('@discordjs/builders');

const { iqCollection } = require('../dbObject.js');

const chalk = require('chalk');
const { logConsole } = require('../util.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('iq-reset')
        .setDescription('Reset your IQ highscore.'),
    async execute(interaction) {
        const interaction_user = interaction.user ? interaction.user : interaction.author;
        const user_id = interaction_user.id;

        const user = iqCollection.get(user_id);
        if (!user || user.iq === 0) {
            return await interaction.reply('You have not calculated your IQ yet.');
        }

        user.iq = 0;
        user.save();

        logConsole(chalk.bgMagentaBright(`${interaction_user}`) + ' has reset their IQ');

        return await interaction.reply('You have reset your IQ.');
    },
};