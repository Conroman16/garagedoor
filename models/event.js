module.exports = (sequelize, DataTypes) => {

	var Event = sequelize.define("Event", {
		event: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		data: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null
		}
	});

	return Event;
}
