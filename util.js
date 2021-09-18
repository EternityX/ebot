const chalk = require('chalk');

function logConsole(str) {
	const time = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
	console.log(chalk.magentaBright('[' + time + '] '), str);
}

module.exports = {
	logConsole,
};