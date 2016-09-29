var router = require('express').Router();

module.exports = (GarageDoor) => {

	router.get('/', (req, res) => {
		res.render('index', {
			DoorIsOpen: !GarageDoor.gpio.doorIsClosed,
			WundergroundApiKey: GarageDoor.config.apikeys.wunderground,
			Location: GarageDoor.config.location,
			PinLength: GarageDoor.config.doorcode.length
		});
	});

	return router;
}
