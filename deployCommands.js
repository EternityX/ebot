/* eslint-disable no-unused-vars */
/* eslint-disable spaced-comment */
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	console.log(command.data);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

const prod = process.argv.includes('--prod') || process.argv.includes('-p');

(async () => {
	try {
		const route = prod ? Routes.applicationCommands(clientId) : Routes.applicationGuildCommands(clientId, guildId);

		await rest.put(
			route,
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	}
	catch (error) {
		console.error(error);
	}
})();