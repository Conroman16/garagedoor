var dashArgs = [],
	isDev = false;

for (var i = 0; i < process.argv.length; i++){
	var arg = process.argv[i];
	if (arg[0] && arg[0] === '-'){
		var cleanArg = arg.replace('-', '');
		dashArgs.push(cleanArg);
	}
}

if (dashArgs.indexOf('dev') >= 0 || (process.env.NODE_ENV || '').indexOf('dev') >= 0){
	console.log('DEV MODE');
	isDev = true;
	process.env.NODE_ENV = 'development';
}
else
	process.env.NODE_ENV = 'production';

var _ = require('underscore'),
	fs = require('fs'),
	path = require('path'),
	models = require('./data/models');

var GarageDoor = {

	POSITION_SENSOR_GPIO_PIN: 11,	// Physical pin number
	OPENER_RELAY_GPIO_PIN: 29,		// Physical pin number
	DOOR_TOGGLE_TIME: 500, 			// Milliseconds
	BASE_PATH: __dirname,
	CONFIG_FILE_PATH: path.join(__dirname, '.config'),
	LIB_PATH: path.join(__dirname, 'lib'),
	VIEWS_PATH: path.join(__dirname, 'web', 'views'),
	STATIC_FILES_PATH: path.join(__dirname, 'web', 'static'),
	SSL_DATA_PATH: path.join(__dirname, 'web', 'letsencrypt'),
	GPIO_IS_INITIALIZED: false,
	arguments: dashArgs,
	isDev: isDev,
	modules: [
		'gpio.js',
		'events.js',
		'data.js',
		'server.js'
	],

	start: function(){
		var self = this;

		this.config.read();

		_.each(this.modules, (module) => {
			require(path.join(self.LIB_PATH, module))(this);
		});

		models.sequelize.sync().then(() => {
			this.gpio.initialize();
			this.server.initialize();
			this.events.initialize();
		});
	},

	config: {
		read: () => {
			var fileContents = fs.readFileSync(GarageDoor.CONFIG_FILE_PATH, 'utf8');
			var config = JSON.parse(fileContents);
			_.extend(GarageDoor.config, config);
		}
	}
};

// Start
GarageDoor.start();
