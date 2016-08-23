module.exports = function(GarageDoor, gpio, io, debounce){

	Object.assign(GarageDoor, {
		gpio: {
			initialize: function(){
				gpio.setup(GarageDoor.POSITION_SENSOR_GPIO_PIN, gpio.DIR_IN, gpio.EDGE_BOTH);
				gpio.setup(GarageDoor.OPENER_RELAY_GPIO_PIN, gpio.DIR_OUT);
				gpio.on('change', this.onChange);

				GarageDoor.GPIO_IS_INITIALIZED = true;
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
		}
	});
}