module.exports = (sequelize, DataTypes) => {

	var DoorEvent = sequelize.define("DoorEvent", {
		isOpen: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		}
	});

	return DoorEvent;
}
