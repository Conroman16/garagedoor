$(function(){
	var $page = $('.page');
	$page.removeClass('unloaded');

	var socket = io.connect({'sync disconnect on unload': true });

	$.extend(GarageDoor, {
		socket: socket,
		events: {
			doorOpen: function (){
				GarageDoor.view.$status.text('Door is open');
				GarageDoor.view.$led.removeClass('green yellow');
				GarageDoor.view.$led.addClass('red');
			},

			doorClose: function (){
				GarageDoor.view.$status.text('Door is closed');
				GarageDoor.view.$led.removeClass('red yellow');
				GarageDoor.view.$led.addClass('green');
			},

			socketDisconnect: function(){
				GarageDoor.view.$status.text('Disconnected');
				GarageDoor.view.$led.removeClass('green red');
				GarageDoor.view.$led.addClass('yellow');
				GarageDoor.view.$page.addClass('disconnected');
				$('body').append('<div class="overlay"></div>');
			},

			socketConnect: function(){
				if (GarageDoor.server.doorIsOpen)
					this.doorOpen();
				else
					this.doorClose();

				$('.overlay').remove();
				GarageDoor.view.$page.removeClass('disconnected');
			},

			bindSocketEvents: function(){
				var self = this;
				GarageDoor.socket.on('dooropen', function(){
					self.doorOpen();
				});
				GarageDoor.socket.on('doorclose', function(){
					self.doorClose();
				});
				GarageDoor.socket.on('disconnect', function(){
					self.socketDisconnect();
				});
				GarageDoor.socket.on('connect', function(){
					self.socketConnect();
				});
			}
		},

		view: {
			$page: $page,
			$status: $('.status-wrap .status-message'),
			$led: $('.status-wrap .led'),
			$doorToggle: $('.js-door-state-toggle'),
			isNight: false,

			toggleNightMode: function(){
				$('body').toggleClass('night');
				if (!this.isNight)
					this.isNight = true;
				else
					this.isNight = false;
			},

			scheduleThemeChange: function(date){
				var self = this,
					offset = date - new Date();

				setTimeout(function(){
					self.toggleNightMode();
				}, offset);
			},

			getSunPhase: function(){
				return new Promise(function(resolve, reject){
					var key = GarageDoor.server.wundergroundApiKey,
						state = GarageDoor.server.location.state,
						city = GarageDoor.server.location.city,
						url = 'https://api.wunderground.com/api/' + GarageDoor.server.wundergroundApiKey + '/astronomy/q/' + state + '/' + city + '.json';

					$.ajax({
						url: url,
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

			setTheme: function(){
				var self = this;
				this.getSunPhase().then(function(data){
					var sunrise = new Date(),
						sunset = new Date();

					sunrise.setHours(data.sunrise.hour);
					sunrise.setMinutes(data.sunrise.minute);

					sunset.setHours(data.sunset.hour);
					sunset.setMinutes(data.sunset.minute);

					var now = new Date();
					if (now >= sunset || now < sunrise){
						self.toggleNightMode();
					}

					// Before midnight, today's sunrise has already happened,
					// so `now <= sunrise` can only be true in the AM hours before sunrise
					if (self.isNight && now <= sunrise){  // AM night
						self.scheduleThemeChange(sunrise);
						self.scheduleThemeChange(sunset);
						log('Page will transition to day mode at ' + sunrise);
						log('Page will transition to night mode at ' + sunset);
					}
					else if (!self.isNight){ // Day
						self.scheduleThemeChange(sunset);
						log('Page will transition to night mode at ' + sunset);
					}

					self.scheduleReloadAtMidnight();
				});
			},

			getNextMidnight: function(){
				var midnight = new Date();
				midnight.setDate(midnight.getDate() + 1);
				midnight.setHours(00);
				midnight.setMinutes(00);
				return midnight;
			},

			scheduleReloadAtMidnight: function(){
				var midnight = this.getNextMidnight();

				setTimeout(function(){
					window.location.reload();
				}, midnight - new Date());

				log('Page will be reloaded at ' + midnight);
			}
		},

		toggleState: function (){
			socket.emit('toggledoorstate');
		}
	});

	GarageDoor.view.setTheme();

	GarageDoor.events.bindSocketEvents();

	GarageDoor.view.$doorToggle.click(function(){
		GarageDoor.toggleState();
	});
});
