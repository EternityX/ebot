const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const osu = require('node-os-utils');
const humanizeDuration = require('humanize-duration');

const prod = process.argv.includes('--prod') || process.argv.includes('-p');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Returns status information.'),
    async execute(interaction) {
        const embed = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
            .setTitle('Bot Status')
            .setThumbnail('https://i.imgur.com/5bPWrtH.gif')
            .setDescription(
                'Cool!',
            )
            .addFields(
                { name: 'Uptime', value: humanizeDuration(process.uptime() * 1000, { round: true }) },
                { name: 'System Load', value: `${await osu.cpu.usage().then(perc => {return perc;})}%` },
                { name: 'Processor', value: `${osu.cpu.model()}` },
                { name: 'Memory (free/total)', value: `${await osu.mem.info().then(info => {return info.freeMemMb;})} MB / ${await osu.mem.info().then(info => {return info.totalMemMb;})} MB` },
                prod ? { name: 'Disk (free/total)', value: `${await osu.drive.info().then(info => {return info.freeGb;})} GB / ${await osu.drive.info().then(info => {return info.totalGb;})} GB` } 
                    : { name: 'Disk (free/total)', value: 'No disk info available' },
            )
            .setFooter('eternity#0001')
            .setTimestamp();

        return await interaction.reply({ embeds: [embed] });
    },
};