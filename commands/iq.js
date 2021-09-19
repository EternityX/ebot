const { SlashCommandBuilder } = require('@discordjs/builders');

const Chance = require('chance');
const chance = new Chance();

const { Users, userCollection } = require('../dbObject.js');

const chalk = require('chalk');
const humanizeDuration = require('humanize-duration');
const { logConsole } = require('../util.js');

function weightedRandomDistrib(min, max, mean, varianceFactor) {
    const prob = [], seq = [];
    for (let i = min; i <= max; i++) {
        prob.push(Math.pow(max - Math.abs(mean - i), varianceFactor));
        seq.push(i);
    }
    return chance.weighted(seq, prob);
}

function getMessage(iq) {
    let iqMessage = 'Your IQ is ' + iq.toString();

    if (iq < 79) {
        iqMessage += ' :monkey:';
    }
    else if (iq < 88) {
        iqMessage += ' :snail:';
    }
    else if (iq < 100) {
        // iqMessage += ' :ok:';
    }
    else if (iq == 200) {
        iqMessage += ' :trophy:';
    }
    else if (iq > 180) {
        iqMessage += ' :alien:';
    }
    else if (iq > 160) {
        iqMessage += ' :exploding_head:';
    }
    else if (iq > 140) {
        iqMessage += ' :brain:';
    }

    return iqMessage;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('iq')
        .setDescription('Accurately calculates your IQ.'),
    async execute(interaction) {
        const interaction_user = interaction.user ? interaction.user : interaction.author;
        const user_id = interaction_user.id;
        
        // 70-200 with mean average of 98
        const iq = weightedRandomDistrib(70, 200, 98, 8.5);

        const user = userCollection.get(user_id);
        if (!user) {
            const newUser = await Users.create({ user_id: user_id, iq: iq });
            userCollection.set(user_id, newUser);
            logConsole(chalk.bgCyan(`Created user for ${user_id}`));

            return await interaction.reply(getMessage(iq));
        }

        if (user.iq_cmd_delay) {
            const remaining = humanizeDuration(user.iq_cmd_delay - Date.now(), { round: true });
            return await interaction.reply(`You must wait ${remaining} before you can use this command again.`);
        }

        user.iq_cmd_delay = Date.now() + 60000;
        setTimeout(() => user.iq_cmd_delay = 0, 60000);

        /* if (user_id === '147239421341597696') {
            iq = 200;
        } */

        if (iq > user.iq) {
            user.iq = iq;
            user.save();

            return await interaction.reply(getMessage(user.iq) + ' (You\'ve grown more intelligent!)');
        }

        return await interaction.reply(getMessage(iq));
    },
};