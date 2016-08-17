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
			}, 100)
		}
	};

app.engine('swig', swig.renderFile);
app.set('view engine', 'swig');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use('/static', express.static(path.join(__dirname, 'src', 'static')));

app.get('/', function(req, res){
	res.render('index', {DoorIsOpen: false});
});

io.on('connection', function(socket) {
	console.log('Socket connected');
	
	socket.on('test', function (data) {
		console.log(data);
	});
});

io.on('disconnect', function(socket){
	console.log('Socket disconnected');
});

http.listen(1693, function(){
	console.log('Application started on *:1693');
});

gpio.setup(11, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.on('change', GarageDoor.gpio.onChange);

// process.on('SIGINT', function(){
// 	if (gpioIsInitialized){
// 		console.log('\nFreeing resources...');
// 		gpio.destroy();
// 	}
// });