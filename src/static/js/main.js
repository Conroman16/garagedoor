$(function(){
	$('.page').removeClass('unloaded');

	var socket = io.connect(),
		$status = $('.status-wrap .status-message'),
		$led = $('.status-wrap .led'),
		$doorToggle = $('.js-door-state-toggle');

	$.extend(GarageDoor, {
		events: {
			doorOpen: function (){
				$status.text('Door is open');
				$led.removeClass('green');
				$led.addClass('red');
			},
			doorClose: function (){
				$status.text('Door is closed');
				$led.removeClass('red');
				$led.addClass('green');
			}
		},

		toggleState: function (){
			socket.emit('toggledoorstate');
		}
	});

	if (GarageDoor.server.doorIsOpen)
		GarageDoor.events.doorOpen();
	else
		GarageDoor.events.doorClose();

	socket.on('dooropen', function (data) {
		GarageDoor.events.doorOpen();
	});
	socket.on('doorclose', function(data){
		GarageDoor.events.doorClose();
	});

	$doorToggle.click(function(){
		GarageDoor.toggleState();
		setTimeout(function(){
			$page.trigger('click');
		}, 2000);
	});
});