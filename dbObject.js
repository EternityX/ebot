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

const Keyv = require('keyv');
const allowedChannels = new Keyv('sqlite://database.sqlite', { namespace: 'allowedChannels', busyTimeout: 10000 });

module.exports = { Users, userCollection, allowedChannels };