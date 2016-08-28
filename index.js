var fs = require('fs'),
	gpio = require('rpi-gpio'),
	path = require('path');

var GarageDoor = {

	POSITION_SENSOR_GPIO_PIN: 11,	// Physical pin number
	OPENER_RELAY_GPIO_PIN: 13,		// Physical pin number
	DOOR_TOGGLE_TIME: 500, 			// Milliseconds
	BASE_PATH: __dirname,
	VIEWS_PATH: path.join(__dirname, 'src', 'views'),
	STATIC_FILES_PATH: path.join(__dirname, 'src', 'static'),
	LIB_PATH: path.join(__dirname, 'src', 'lib'),
	GPIO_IS_INITIALIZED: false,

	start: function(){
		this.config.read();

		require(path.join(this.LIB_PATH,'gpio.js'))(this, gpio);
		require(path.join(this.LIB_PATH, 'server.js'))(this, path);

		this.gpio.initialize();
		this.server.initialize();

		this.registerExitEvents();
	},

	events: {
		doorOpen: function(){
			GarageDoor.sockets.io.emit('dooropen')
			console.log('Door opened');
		},
		doorClose: function(){
			GarageDoor.sockets.io.emit('doorclose');
			console.log('Door closed');
		},
		processExit: function(event){
			if (!!GarageDoor.GPIO_IS_INITIALIZED){
				console.log(`\n${event} received.  Freeing resources...`);
				gpio.destroy(function(){
					process.exit();
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
	},

	registerExitEvents: function(){
		process.on('SIGINT', function(){
			GarageDoor.events.processExit('SIGINT');
		});
		process.on('SIGTERM', function(){
			GarageDoor.events.processExit('SIGTERM');
		});
	}
};

// Start
GarageDoor.start();
