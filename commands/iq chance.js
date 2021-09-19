const { SlashCommandBuilder } = require('@discordjs/builders');

const readline = require('readline');
const { logConsole } = require('../util.js');

const Chance = require('chance');
const chance = new Chance();

const min = 70;
const max = 200;
const mean = 98;
const varianceFactor = 8.5;

const prob = [], iq = [];

const calculatedIQs = [];
const counts = {};

for (let i = min; i <= max; i++) {
    prob.push(Math.pow(max - Math.abs(mean - i), varianceFactor));
    iq.push(i);
}

console.clear();
readline.clearLine(process.stdout, 0);

iq.forEach(function(i) { 
    while (!counts[i]) {
        calculatedIQs.push(chance.weighted(iq, prob));
        calculatedIQs.forEach(function(x) { counts[x] = (counts[x] || 0) + 1; });
    }

    readline.cursorTo(process.stdout, 0, 0);
    process.stdout.write('Calculating probability for ' + i + '\n');
});

logConsole(`Finished generating IQ probabilities in ${calculatedIQs.length} iterations`);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('iq-chance')
        .setDescription('Returns the chance of calculating the given IQ.')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('An IQ (between 70-200) to calculate the chance for.')
                .setRequired(true)),
    async execute(interaction) {
        let option = interaction.options.getInteger('number');
        if (option < 70 || option > 200) {
            option = Math.min(Math.max(option, min), max);
        }
        
        const count = Math.ceil(counts[option] / calculatedIQs.length);
        const fraction = Math.ceil(calculatedIQs.length / count);

        // console.log(option + ' was returned ' + count + ' times in ' + calculatedIQs.length + ' iterations.');

        return await interaction.reply(`The probability of getting ${option} IQ is roughly 1 in ${fraction} (${((1 / fraction) * 100).toFixed(4)}%)`);
    },
};