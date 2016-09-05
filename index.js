var fs = require('fs'),
	gpio = require('rpi-gpio'),
	path = require('path'),
	moment = require('moment'),
	dashArgs = [],
	isDev = false;

for (var i = 0; i < process.argv.length; i++){
	var arg = process.argv[i];
	if (arg[0] && arg[0] === '-'){
		var cleanArg = arg.replace('-', '');
		dashArgs.push(cleanArg);
	}
}
dashArgs = dashArgs.reverse();

if (dashArgs.indexOf('dev') >= 0){
	isDev = true;
	console.log('DEV MODE');
}

var GarageDoor = {

	POSITION_SENSOR_GPIO_PIN: 11,	// Physical pin number
	OPENER_RELAY_GPIO_PIN: 29,		// Physical pin number
	DOOR_TOGGLE_TIME: 500, 			// Milliseconds
	BASE_PATH: __dirname,
	VIEWS_PATH: path.join(__dirname, 'src', 'views'),
	STATIC_FILES_PATH: path.join(__dirname, 'src', 'static'),
	LIB_PATH: path.join(__dirname, 'src', 'lib'),
	SSL_DATA_PATH: path.join(__dirname, 'letsencrypt'),
	LETSENCRYPT_CA_URL: 'https://acme-v01.api.letsencrypt.org/directory',
	GPIO_IS_INITIALIZED: false,
	arguments: dashArgs,
	isDev: isDev,

	start: function(){
		this.config.read();

		require(path.join(this.LIB_PATH, 'gpio.js'))(this, gpio);
		require(path.join(this.LIB_PATH, 'server.js'))(this, path);

		this.gpio.initialize();
		this.server.initialize();

		this.events.registerExitEvents();
	},

	events: {
		exit: ['SIGINT', 'SIGTERM'],
		doorOpen: function(){
			if (!GarageDoor.gpio.doorIsClosed)
				return;
			else
				GarageDoor.gpio.doorIsClosed = false;

			GarageDoor.sockets.io.emit('dooropen');
			var date = moment().format('h:mm:ss a');
			console.log(`[${date}] Door open`);
		},
		doorClose: function(){
			if (GarageDoor.gpio.doorIsClosed)
				return;
			else
				GarageDoor.gpio.doorIsClosed = true;

			GarageDoor.sockets.io.emit('doorclose');
			var date = moment().format('h:mm:ss a');
			console.log(`[${date}] Door closed`);
		},
		processExit: function(event){
			if (!!GarageDoor.GPIO_IS_INITIALIZED){
				console.log(`\n${event} received.  Freeing resources...`);
				gpio.destroy(() => {
					process.exit();
				});
			}
		},
		registerExitEvents: function(){
			var self = this;
			for (var i = 0; i < this.exit.length; i++){
				var event = this.exit[i];
				process.on(event, function(){
					self.processExit(event);
				});
			}
		}
	},

	config: {
		read: () => {
			var fileContents = fs.readFileSync(path.join(__dirname, '.config'), 'utf8');
			var config = JSON.parse(fileContents);
			Object.assign(GarageDoor.config, config);
		}
	}
};

// Start
GarageDoor.start();
