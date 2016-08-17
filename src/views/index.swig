{% extends 'shared/layout.swig' %}

{% block body %}
<div class="status-wrap">
	<div class="led"></div>
	<div class="status-message"></div>
</div>
{% endblock %}

{% block scripts %}
<script>
	var socket = io.connect();
	$(function(){
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

		var $status = $('.status-wrap .status-message'),
		$led = $('.status-wrap .led');

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