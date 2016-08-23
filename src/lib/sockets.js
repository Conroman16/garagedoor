module.exports = function(GarageDoor, io){
	Object.assign(GarageDoor, {
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
		}
	});
}