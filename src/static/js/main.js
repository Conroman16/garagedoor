$(function(){
	var $page = $('.page');
	$page.removeClass('unloaded');

	var socket = io.connect({'sync disconnect on unload': true }),
		$status = $('.status-wrap .status-message'),
		$led = $('.status-wrap .led'),
		$doorToggle = $('.js-door-state-toggle');

	$.extend(GarageDoor, {
		events: {
			doorOpen: function (){
				$status.text('Door is open');
				$led.removeClass('green yellow');
				$led.addClass('red');
			},
			doorClose: function (){
				$status.text('Door is closed');
				$led.removeClass('red yellow');
				$led.addClass('green');
			},
			socketDisconnect: function(){
				$status.text('Disconnected');
				$led.removeClass('green red');
				$led.addClass('yellow');
				$page.addClass('disconnected');
				$('body').append('<div class="overlay"></div>');
			},
			socketConnect: function(){
				if (GarageDoor.server.doorIsOpen)
					this.doorOpen();
				else
					this.doorClose();

				$('.overlay').remove();
				$page.removeClass('disconnected');
			}
		},

		toggleState: function (){
			socket.emit('toggledoorstate');
		},

		getSunPhase: function(){
			return new Promise((resolve, reject) => {
				$.ajax({
					url: 'http://api.wunderground.com/api/' + GarageDoor.server.wundergroundApiKey + '/astronomy/q/64151.json',
					dataType: 'jsonp',
					success: function(data, status, xhr){
						resolve(data.sun_phase);
					},
					error: function(xhr, status, err){
						reject(err);
					}
				});
			});
		},

		setViewTheme: function(){
			this.getSunPhase().then((data) => {
				var sunrise = new Date(),
					sunset = new Date();

				sunrise.setHours(data.sunrise.hour);
				sunrise.setMinutes(data.sunrise.minute);

				sunset.setHours(data.sunset.hour);
				sunset.setMinutes(data.sunset.minute);

				var now = new Date();
				if (now >= sunset){
					$('body').addClass('night');
					console.log('Its night');
				}
				else if (now < sunrise){
					$('body').addClass('night');
					console.log('Its night');
				}
			});
		}
	});

	GarageDoor.setViewTheme();

	socket.on('dooropen', function (data) {
		GarageDoor.events.doorOpen();
	});
	socket.on('doorclose', function(data){
		GarageDoor.events.doorClose();
	});
	socket.on('disconnect', function(){
		GarageDoor.events.socketDisconnect();
	});
	socket.on('connect', function(){
		GarageDoor.events.socketConnect();
	});

	$doorToggle.click(function(){
		GarageDoor.toggleState();
		setTimeout(function(){
			$page.trigger('click');
		}, 2000);
	});
});