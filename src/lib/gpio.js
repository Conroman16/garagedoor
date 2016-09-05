var debounce = require('debounce');

module.exports = function(GarageDoor, gpio){

	// The way the circuit is wired, a value of '1' or 'true' indicates that
	// the door is closed and a value of '0' or 'false' indicates it's open
	Object.assign(GarageDoor, {
		gpio: {
			debounceInterval: 250,
			doorIsClosed: true,

			initialize: function(){
				gpio.setup(GarageDoor.POSITION_SENSOR_GPIO_PIN, gpio.DIR_IN, gpio.EDGE_BOTH, this.setDoorStatus);
				gpio.setup(GarageDoor.OPENER_RELAY_GPIO_PIN, gpio.DIR_OUT);
				gpio.on('change', this.onChange);

				GarageDoor.GPIO_IS_INITIALIZED = true;
			},
			onChange: debounce(function(channel, value){
				value = !value;
				switch (channel){
					case GarageDoor.POSITION_SENSOR_GPIO_PIN:
						if (value)
							GarageDoor.events.doorOpen();
						else
							GarageDoor.events.doorClose();
						break;
				}
			}, this.debounceInterval),
			setDoorStatus: function(){
				// Door is open method updates value of GarageDoor.gpio.doorIsClosed internally
				GarageDoor.gpio.doorIsOpen();
			},
			doorIsOpen: function(callback){
				var self = this;
				gpio.read(GarageDoor.POSITION_SENSOR_GPIO_PIN, function(err, value){
					if (err){
						console.log(`ERROR: ${err}`);
						throw err;
					}

					self.doorIsOpen = value;
					if (!!callback)
						callback(!value);
				});
			},
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
		}
	});
}
