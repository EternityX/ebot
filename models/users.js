module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		cmd_delay: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
			allowNull: false,
		},
		iq: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		iq_cmd_delay: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};
