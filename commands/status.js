const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const os = require('os');
const process = require('process');

const humanizeDuration = require('humanize-duration');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Returns status information.'),
    async execute(interaction) {
        const cpus = os.cpus();
        const cpu = cpus[0];

        // Accumulate every CPU times values
        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);

        // Normalize the one returned by process.cpuUsage() 
        // (microseconds VS miliseconds)
        const usage = process.cpuUsage();
        const currentCPUUsage = (usage.user + usage.system) * 1000;

        // Find out the percentage used for this specific CPU
        const perc = currentCPUUsage / total * 100;

        const embed = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
            .setTitle('Bot Status')
            .setThumbnail('https://i.imgur.com/5bPWrtH.gif')
            .setDescription(
                'Cool!',
            )
            .addFields(
                { name: 'Bot uptime', value: humanizeDuration(process.uptime(), { round: true }) },
                { name: 'Server uptime', value: humanizeDuration(os.uptime(), { round: true }) },
                { name: 'System Load', value: `${Math.round(perc)}%` },
                { name: 'Processor', value: `${cpu.model} (Usage: ${Math.round(perc)}%)` },
                { name: 'Memory (free/total)', value: `${Math.round(os.freemem() / 1024 / 1024)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB` },
            )
            .setFooter('eternity#0001')
            .setTimestamp();

        return await interaction.reply({ embeds: [embed] });
    },
};