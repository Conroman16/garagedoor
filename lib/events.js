module.exports = function(GarageDoor, _){

	GarageDoor.events = {
		exit: ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK', 'PROCERR'],
		initialize: () => {
			GarageDoor.events.registerErrorHandler();
			GarageDoor.events.registerExitEvents();
			GarageDoor.events.registerDoorEvents();
		},
		doorOpen: function(){
			if (!GarageDoor.gpio.doorIsClosed)
				return;
			else
				GarageDoor.gpio.doorIsClosed = false;

			GarageDoor.sockets.io.emit('dooropen');
			console.log('Door open');
			GarageDoor.data.logDoorOpen(true);
		},
		doorClose: function(){
			if (GarageDoor.gpio.doorIsClosed)
				return;
			else
				GarageDoor.gpio.doorIsClosed = true;

			GarageDoor.sockets.io.emit('doorclose');
			console.log('Door closed');
			GarageDoor.data.logDoorClose(false);
		},
		processExit: function(event){
			if (GarageDoor.GPIO_IS_INITIALIZED){
				console.log(`\n${event} received.  Freeing resources...`);
				GarageDoor.gpio.middleware.destroy(() => {
					process.exit();
				});
			}
		},
		registerErrorHandler: () => {
			process.on('uncaughtException', (err) => {
				GarageDoor.data.logError(err);
				console.log(err.stack ? err.stack : err);

				if (GarageDoor.isDev)
					process.emit('PROCERR');
			});
		},
		registerExitEvents: function(){
			var self = this;
			_.each(this.exit, (event) => {
				process.on(event, () => {
					self.processExit(event);
				});
			});
		},
		registerDoorEvents: () => {
			process.on('DOOROPEN', GarageDoor.events.doorOpen);
			process.on('DOORCLOSED', GarageDoor.events.doorClose);
		}
	}
};
