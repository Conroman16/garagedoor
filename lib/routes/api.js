var models = require('../../data/models'),
	router = require('express').Router();

module.exports = (GarageDoor) => {

	router.get('/test', (req, res) => {
		res.send({
			params: req.params,
			query: req.query
		});
	});

	router.get('/guest/:code', (req, res) => {
		if (!req.params.code){
			res.send('Invalid code');
			return;
		}
	});

	return router;
}
