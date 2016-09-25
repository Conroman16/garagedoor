module.exports = (sequelize, DataTypes) => {

	var AppError = sequelize.define("Error", {
		message: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		stack: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null
		}
	});

	return AppError;
}
