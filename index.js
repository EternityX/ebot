// Config
const { token, prefix } = require('./config.json');

const fs = require('fs');
const { Collection, MessageEmbed } = require('discord.js');

// Utils
const chalk = require('chalk');
const humanizeDuration = require('humanize-duration');
const { logConsole } = require('./util.js');

const { client } = require('./client.js');
const { Users, userCollection, allowedChannels } = require('./dbObject.js');

// Setup commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
	try {
		allowedChannels.on('error', err => console.error('Keyv connection error:', err));

		client.user.setActivity('e-bot | $help', { type: 'PLAYING' });
		
		const storedIQs = await Users.findAll();
		storedIQs.forEach(b => userCollection.set(b.user_id, b));

		userCollection.forEach(b => b.iq_cmd_delay = 0);
		userCollection.forEach(b => b.cmd_delay = 0);

		client.guilds.cache.map(async guild => {
			client.guilds.cache.get(guild.id).members.fetch();

			const allowedChannel = await allowedChannels.get(guild.id);
			if (!allowedChannel) {
				await allowedChannels.set(guild.id, 1);
			}
		});

		logConsole(chalk.green('Ready!'));
	}
	catch (error) {
		console.error(error);
	}
});

client.on('interactionCreate', async interaction => {
	try {
		if (!interaction.isCommand()) {
			return;
		}

		const command = client.commands.get(interaction.commandName);
		if (!command) {
			return;
		}

		if (interaction.commandName != 'limit-channel') {
			const allowedChannel = await allowedChannels.get(interaction.guild.id);
			if (allowedChannel > 1 && allowedChannel != interaction.channel.id) {
				return await interaction.reply({ content: `${await client.channels.fetch(allowedChannel)}`, ephemeral: false });
			}
		}

		if (interaction.commandName === 'uc') {
			await interaction.deferReply();
			await command.execute(interaction);

			await interaction.editReply({ content: 'Here is your thread sir' }).then(msg => {
				setTimeout(() => msg.delete(), 7500);
			});

			const collector = interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 45000 });

			collector.on('collect', async i => {
				await i.deferReply();
				await command.execute(interaction);
				await i.deleteReply();
			});
		}
		else {
			const user = userCollection.get(interaction.user.id);

			if (user) {
				if (user.cmd_delay) {
					const remaining = humanizeDuration(user.cmd_delay - Date.now(), { units: ['m'], round: true });
					return await interaction.reply(`You must wait ${remaining} before using another command.`);
				}

				user.cmd_delay = Date.now() + 2000;
				setTimeout(() => user.cmd_delay = 0, 2000);

				user.save();
			}

			await command.execute(interaction);
		}
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'ooopsies i done a fucky wucky :33', ephemeral: false });
	}
});

async function doTimeout(message) {
	const user = userCollection.get(message.author.id);

	if (user) {
		if (user.cmd_delay) {
			const remaining = humanizeDuration(user.cmd_delay - Date.now());
			return await message.reply(`You must wait ${remaining} before using another command.`);
		}

		user.cmd_delay = Date.now() + 2000;
		setTimeout(() => user.cmd_delay = 0, 2000);

		user.save();
	}

	return false;
}

client.on('messageCreate', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	let command = args.shift().toLowerCase();

	// args = args.toString().split(' ').join('/');

	if (command === 'help') {
		if (await doTimeout(message)) {
			return;
		}

		const embed = new MessageEmbed()
			.setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
			.setTitle('Commands')
			.setThumbnail('https://i.imgur.com/5bPWrtH.gif')
			.setDescription(
				'The e in e-bot stands for epic.\nNot all commands are available with `$`, prefer using Slash `/` commands.',
			)
			.addFields(
				{ name: '$uc', value: 'Displays a random UC thread.' },
				{ name: '$iq', value: 'Accurately calculates your IQ.' },
				{ name: '$iq top', value: 'Displays the IQ leaderboard for this server.' },
				{ name: '$iq global', value: 'Displays the global IQ leaderboard.' },
				{ name: '$iq reset', value: 'Resets your IQ highscore.' },
				{ name: '$status', value: 'Displays status information.' },
			)
			.setTimestamp();

		await message.reply({ embeds: [embed] });
	}
	else {
		if (await doTimeout(message)) {
			return;
		}
		
		// Format arguments into the new command
		args.forEach(function(x) { 
			command += `-${x}`;
		});

		const c = client.commands.get(command);
		if (c) {
			c.execute(message);
		}
	}
});

client.login(token);