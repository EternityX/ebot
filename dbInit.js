const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', '', '', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

require('./models/users.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	console.log(`Database synced (forced: ${force})`);
	sequelize.close();
}).catch(console.error);