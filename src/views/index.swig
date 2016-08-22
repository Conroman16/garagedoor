{% extends 'shared/layout.swig' %}

{% block body %}
<div class="status-wrap">
	<div class="led"></div>
	<div class="status-message"></div>
</div>
<div>
	<button class='toggle-door-state'>Toggle Door State</button>
</div>
{% endblock %}

{% block scripts %}
<script>
	$(function(){
		var socket = io.connect();
		
		function setDoorOpen(){
			$status.text('Door is open');
			$led.removeClass('green');
			$led.addClass('red');
		}
		function setDoorClosed(){
			$status.text('Door is closed');
			$led.removeClass('red');
			$led.addClass('green');
		}
		function toggleDoorState(){
			socket.emit('toggledoorstate');
		}

		var $status = $('.status-wrap .status-message'),
			$led = $('.status-wrap .led'),
			$doorToggle = $('.toggle-door-state');

			$doorToggle.click(function(){
				toggleDoorState();
			});

		if (GarageDoor.server.doorIsOpen)
			setDoorOpen();
		else
			setDoorClosed();

		socket.on('dooropen', function (data) {
			setDoorOpen();
		});
		socket.on('doorclose', function(data){
			setDoorClosed();
		});
	});
</script>
{% endblock %}