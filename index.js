var gpio = require('rpi-gpio'),
	debounce = require('debounce'),
	path = require('path'),
	express = require('express'),
	app = express(),
	http = require('http').Server(app),
	sass = require('node-sass-middleware'),
	io = require('socket.io')(http),
	swig = require('swig');

var GarageDoor = {

	POSITION_SENSOR_GPIO_PIN: 11,	// Physical pin number
	OPENER_RELAY_GPIO_PIN: 13,		// Physical pin number
	DOOR_TOGGLE_TIME: 500, 			// Milliseconds
	BASE_PATH: __dirname,
	VIEWS_PATH: path.join(__dirname, 'src', 'views'),
	STATIC_FILES_PATH: path.join(__dirname, 'src', 'static'),
	LIB_PATH: path.join(__dirname, 'src', 'lib'),
	GPIO_IS_INITIALIZED: false,

	initialize: function(){
		require(this.LIB_PATH + '/gpio.js')(this, gpio, io, debounce);
		require(this.LIB_PATH + '/server.js')(this, path, http, express, app, sass, swig);
		require(this.LIB_PATH + '/sockets.js')(this, io);

		this.gpio.initialize();
		this.server.initialize();
		this.sockets.initialize();
	},

	events: {
		doorOpen: function(){
			io.emit('dooropen')
			console.log('Door opened');
		},
		doorClose: function(){
			io.emit('doorclose');
			console.log('Door closed');
		},
		processExit: function(){
			if (!!GarageDoor.GPIO_IS_INITIALIZED){
				console.log('\nFreeing resources...');
				gpio.destroy(function(){
					process.exit();
				});
			}
		}
	}
};

// Start
GarageDoor.initialize();

process.on('SIGINT', GarageDoor.events.processExit);