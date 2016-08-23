{% extends 'shared/layout.swig' %}

{% block body %}
<div class="page">
	<div class="grid grid-pad">
		<div class="col-1-1">
			<div class="content center">
				<div class="status-wrap">
					<div class="status-led led"></div>
					<div class="status-message"></div>
				</div>
				<div class="door-toggle">
					<button class="button toggle-door-state">Toggle Door State</button>
				</div>
			</div>
		</div>
	</div>
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
				setTimeout(function(){
					$doorToggle.trigger('mouseout');
				}, 2000);
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