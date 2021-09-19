const { Collection } = require('discord.js');

const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', '', '', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Users = require('./models/users.js')(sequelize, Sequelize.DataTypes);
const userCollection = new Collection();

module.exports = { Users, userCollection };