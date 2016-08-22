var gpio = require('rpi-gpio'),
	debounce = require('debounce'),
	path = require('path'),
	express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	swig = require('swig'),
	gpioIsInitialized = false,
	GarageDoor = {

		POSITION_SENSOR_GPIO_PIN: 11,	// Physical pin number
		OPENER_RELAY_GPIO_PIN: 13,		// Physical pin number
		DOOR_TOGGLE_TIME: 500, 			// Milliseconds

		initialize: function(){
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
			}
		},
		gpio: {
			initialize: function(){
				gpio.setup(GarageDoor.POSITION_SENSOR_GPIO_PIN, gpio.DIR_IN, gpio.EDGE_BOTH);
				gpio.setup(GarageDoor.OPENER_RELAY_GPIO_PIN, gpio.DIR_OUT);
				gpio.on('change', this.onChange);
			},
			onChange: debounce(function(channel, value){
				value = !value;
				switch (channel){
					case 11:
						if (value){
							GarageDoor.events.doorOpen();
						}
						else{
							GarageDoor.events.doorClose();
						}
						break;
				}
			}, 100),
			toggleDoor: function(){
				gpio.write(GarageDoor.OPENER_RELAY_GPIO_PIN, 1, function(err){
					if (err){
						console.log('ERROR: ' + err);
						throw err;
					}

					console.log('Toggling door state');
					setTimeout(function(){
						gpio.write(GarageDoor.OPENER_RELAY_GPIO_PIN, 0, function(err){
							if (err){
								console.log('ERROR: ' + err);
								throw err;
							}

							console.log('Door state toggled successfully');
						});
					}, 500);
				});
			}
		},
		sockets: {
			initialize: function(){
				this.setupEvents();
			},
			setupEvents: function(){
				io.on('connection', function(socket) {
					console.log('Socket connected');

					socket.on('toggledoorstate', function(data){
						GarageDoor.gpio.toggleDoor();
					});
				});
			}
		},
		server: {
			initialize: function(){
				app.engine('swig', swig.renderFile);
				app.set('view engine', 'swig');
				app.set('views', path.join(__dirname, 'src', 'views'));

				app.use('/static', express.static(path.join(__dirname, 'src', 'static')));

				app.get('/', function(req, res){
					res.render('index', {DoorIsOpen: false});
				});

				http.listen(1693, function(){
					console.log('Application started on *:1693');
				});
			}
		}
	};

GarageDoor.initialize();

// process.on('SIGINT', function(){
// 	if (gpioIsInitialized){
// 		console.log('\nFreeing resources...');
// 		gpio.destroy();
// 	}
// });