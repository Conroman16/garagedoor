<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" >

	<title>Garage Door</title>

	<link rel="icon" href="/static/img/favicon.ico" />
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" />
	<link rel="stylesheet" href="/static/css/main.css" />

	{% block style %}{% endblock %}
</head>
<body>
	{% block body %}{% endblock %}

	{# Scripts #}
	<script id="server-vars">
		var GarageDoor = {
			server: {
				doorIsOpen: {{DoorIsOpen}},
				wundergroundApiKey: '{{WundergroundApiKey}}',
				pinLength: {{PinLength}},
				location: {
					city: '{{Location.city}}',
					state: '{{Location.state}}'
				}
			}
		};
	</script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.8/socket.io.min.js"></script>
	<script src="https://code.jquery.com/jquery-3.1.0.min.js" integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s=" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-browser/0.1.0/jquery.browser.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/fingerprintjs2/1.4.1/fingerprint2.min.js"></script>
	<script src="/static/js/common.js"></script>

	<script id="svr">$('#server-vars, #svr').remove()</script>

	{% block scripts %}{% endblock %}
</body>
</html>
