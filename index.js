var dashArgs = [],
	isDev = false;

for (var i = 0; i < process.argv.length; i++){
	var arg = process.argv[i];
	if (arg[0] && arg[0] === '-'){
		var cleanArg = arg.replace('-', '');
		dashArgs.push(cleanArg);
	}
}

if (dashArgs.indexOf('dev') >= 0 || process.env.NODE_ENV === 'development'){
	console.log('DEV MODE');
	isDev = true;
	process.env.NODE_ENV = 'development';
}
else
	process.env.NODE_ENV = 'production';

var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	models = require('./models');

var GarageDoor = {

	POSITION_SENSOR_GPIO_PIN: 11,	// Physical pin number
	OPENER_RELAY_GPIO_PIN: 29,		// Physical pin number
	DOOR_TOGGLE_TIME: 500, 			// Milliseconds
	BASE_PATH: __dirname,
	VIEWS_PATH: path.join(__dirname, 'views'),
	STATIC_FILES_PATH: path.join(__dirname, 'static'),
	LIB_PATH: path.join(__dirname, 'lib'),
	SSL_DATA_PATH: path.join(__dirname, 'letsencrypt'),
	GPIO_IS_INITIALIZED: false,
	arguments: dashArgs,
	isDev: isDev,

	start: function(){
		this.config.read();

		require(path.join(this.LIB_PATH, 'gpio.js'))(this);
		require(path.join(this.LIB_PATH, 'events.js'))(this, _);
		require(path.join(this.LIB_PATH, 'data.js'))(this, _, fs);
		require(path.join(this.LIB_PATH, 'server.js'))(this, _, path);

		models.sequelize.sync().then(() => {
			this.gpio.initialize();
			this.server.initialize();
			this.events.initialize();
		});
	},

	config: {
		read: () => {
			var fileContents = fs.readFileSync(path.join(__dirname, '.config'), 'utf8');
			var config = JSON.parse(fileContents);
			_.extend(GarageDoor.config, config);
		}
	}
};

// Start
GarageDoor.start();
