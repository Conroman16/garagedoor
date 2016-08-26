<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" >
	
	<title>Garage Door</title>

	<link rel="icon" href="/static/img/favicon.ico" />
	<link rel="stylesheet" href="/static/css/main.css" />

	{% block style %}{% endblock %}
</head>
<body>
	{% block body %}{% endblock %}

	{# Scripts #}
	<script>
		var GarageDoor = {
			server: {
				doorIsOpen: {{DoorIsOpen}},
				wundergroundApiKey: '{{WundergroundApiKey}}',
				location: {
					city: '{{Location.city}}',
					state: '{{Location.state}}'
				}
			}
		};
	</script>

	<script src="/socket.io/socket.io.js"></script>
	<script src="https://code.jquery.com/jquery-3.1.0.min.js" integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s=" crossorigin="anonymous"></script>
	<script src="/static/js/common.js"></script>

	{% block scripts %}{% endblock %}
</body>
</html>