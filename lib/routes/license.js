var router = require('express').Router(),
	path = require('path');

module.exports = (GarageDoor) => {

	router.get('/', (req, res) => {
		res.setHeader('Content-Type', 'text/plain');
		res.sendFile(path.join(GarageDoor.BASE_PATH, 'LICENSE'));
	});

	return router;
}
