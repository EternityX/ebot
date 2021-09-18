// Config
const { token } = require('./config.json');

const fs = require('fs');
const { Collection, MessageEmbed } = require('discord.js');

// Utils
const chalk = require('chalk');
const humanizeDuration = require('humanize-duration');
const { logConsole } = require('./util.js');

const { client } = require('./client.js');
const { Users, iqCollection } = require('./dbObject.js');

// Setup commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
	try {
		client.user.setActivity('e-bot | $help', { type: 'PLAYING' });

		const storedIQs = await Users.findAll();
		storedIQs.forEach(b => iqCollection.set(b.user_id, b));
		
		iqCollection.forEach(b => b.iq_cmd_delay = 0);
		iqCollection.forEach(b => b.cmd_delay = 0);

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
			const user = iqCollection.get(interaction.user.id);

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
	const user = iqCollection.get(message.author.id);

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
	if (message.content === '$help') {
		if (await doTimeout(message)) {
			return;
		}

		const embed = new MessageEmbed()
			.setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
			.setTitle('Commands')
			.setThumbnail('https://i.imgur.com/5bPWrtH.gif')
			.setDescription(
				'The e in e-bot stands for epic.\nPrefer using Slash (/) commands.',
			)
			.addFields(
				{ name: '$uc', value: 'Returns a random UC thread.' },
				{ name: '$iq', value: 'Accurately calculates your IQ.' },
				{ name: '$iq top', value: 'Displays the IQ highscores.' },
				{ name: '$iq reset', value: 'Resets your IQ highscore.' },
				{ name: '$status', value: 'Returns status information.' },
			)
			.setTimestamp();

		await message.reply({ embeds: [embed] });
	}
	else if (message.content === '$uc') {
		if (await doTimeout(message)) {
			return;
		}

		const command = client.commands.get('uc');
		command.execute(message);
	}
	else if (message.content === '$iq') {
		if (await doTimeout(message)) {
			return;
		}

		const command = client.commands.get('iq');
		command.execute(message);
	}
	else if (message.content === '$iq reset') {
		if (await doTimeout(message)) {
			return;
		}

		const command = client.commands.get('iq-reset');
		command.execute(message);
	}
	else if (message.content === '$iq top') {
		if (await doTimeout(message)) {
			return;
		}

		const command = client.commands.get('iq-top');
		command.execute(message);
	}
	else if (message.content === '$status') {
		if (await doTimeout(message)) {
			return;
		}

		const command = client.commands.get('status');
		command.execute(message);
	}
});

client.login(token);