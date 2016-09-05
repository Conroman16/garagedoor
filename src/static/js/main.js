$(function(){
	var $page = $('.page');
	$page.removeClass('unloaded');

	var socket = io.connect({'sync disconnect on unload': true });

	$.extend(GarageDoor, {
		initialize: function(){
			if ($.browser.mobile)
				$('body').addClass('mobile');

			var fingerprint = new Fingerprint2();
			fingerprint.get(function(print){
				window.fingerprint = print;
			});

			GarageDoor.view.initialize();
		},
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

			doorAuthReply: function(data){
				if (!data || data.error || !data.success){
					GarageDoor.view.$pinInput.addClass('invalid');
					return false;
				}

				if (data.success){
					GarageDoor.view.$pinInput.addClass('valid');
					GarageDoor.view.setButtonToken(data.token);
					GarageDoor.view.hideAuth();
				}
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
				GarageDoor.socket.on('doorauthreply', function(data){
					self.doorAuthReply(data);
				});
			}
		},

		view: {
			$page: $page,
			$status: $('.status-wrap .status-message'),
			$led: $('.status-wrap .led'),
			$doorToggleWrap: $('.door-toggle'),
			$doorToggle: $('.js-door-state-toggle'),
			$authWrap: $('.auth-wrap'),
			$pinInput: $('.pin-input'),
			$pinValue: $('.pin-val'),
			isNight: false,
			dot: '\u2022',

			initialize: function(){
				GarageDoor.view.setTheme();
				GarageDoor.events.bindSocketEvents();
				GarageDoor.view.$doorToggle.click(function(){
					GarageDoor.toggleState($(this).data('token'));
				});
				GarageDoor.view.maxPinLength = GarageDoor.view.$pinInput.attr('maxlength');
				GarageDoor.view.setPin('');

				GarageDoor.view.$pinInput.on('keyup', function(){
					var $this = $(this),
						value = GarageDoor.view.$pinValue.val();

					if (value.length === 6)
						GarageDoor.view.validatePin(value);
					else
						$this.removeClass('valid invalid');
				});

				$('.keypad-key:not(".backspace-key")').click(function(){
					var $this = $(this),
							value = $this.text(),
							pin = GarageDoor.view.$pinValue.val();

					if (pin.length == GarageDoor.view.maxPinLength)
						return;
					else
						pin += value;

					GarageDoor.view.setPin(pin);
					GarageDoor.view.$pinInput.trigger('keyup');
				});

				$('.backspace-key').click(function(){
					var value = GarageDoor.view.$pinValue.val();
					if (value.length <= 0)
						return;

					value = value.substring(0, value.length - 1);
					GarageDoor.view.setPin(value);
					GarageDoor.view.$pinInput.trigger('keyup');
				});
			},

			toggleNightMode: function(){
				$('body').toggleClass('night');
				if (!this.isNight)
					this.isNight = true;
				else
					this.isNight = false;
			},

			showAuth: function(){
				GarageDoor.view.$doorToggleWrap.addClass('hide');
				GarageDoor.view.$authWrap.removeClass('hide');
			},

			hideAuth: function(){
				GarageDoor.view.$doorToggleWrap.removeClass('hide');
				GarageDoor.view.$authWrap.addClass('hide');
			},

			setButtonToken: function(token){
				GarageDoor.view.$doorToggle.attr('data-token', token);
			},

			scheduleThemeChange: function(date){
				var self = this,
					offset = date - new Date();

				setTimeout(function(){
					self.toggleNightMode();
				}, offset);
			},

			setPin(pin){
				var placeholder = '';
				for (var i = 0; i < pin.length; i++){
					placeholder += GarageDoor.view.dot;
				}
				for (var i = 0; i < GarageDoor.view.maxPinLength - pin.length; i++){
					placeholder += '-';
				}

				GarageDoor.view.$pinInput.val(placeholder);
				GarageDoor.view.$pinValue.val(pin);
			},

			validatePin(pin){
				GarageDoor.socket.emit('doorauth', {
					pin: pin,
					fingerprint: window.fingerprint
				});
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
					if (self.isNight && now < sunrise){  // AM night
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

		toggleState: function (token){
			socket.emit('toggledoorstate', {
				token: token,
				fingerprint: window.fingerprint
			});
		}
	});

	GarageDoor.initialize();
});
