module.exports = (sequelize, DataTypes) => {

	var GuestPermission = sequelize.define("GuestPermission", {
		code: {
			type: DataTypes.STRING,
			allowNull: false
		},
		inactive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		expiration: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		}
	});

	return GuestPermission;
}
