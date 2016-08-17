<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Garage Door</title>

	<link rel="icon" href="/static/img/favicon.ico" />
	<link rel="stylesheet" type="text/css" href="/static/css/style.css" />

	{% block style %}{% endblock %}
</head>
<body>
	{% block body %}{% endblock %}

	{# Scripts #}
	<script>
		var GarageDoor = {};
	</script>

	<script>
		GarageDoor.server = {
			doorIsOpen: {{DoorIsOpen}}
		};
	</script>

	<script src="/socket.io/socket.io.js"></script>
	<script src="https://code.jquery.com/jquery-3.1.0.min.js" integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s=" crossorigin="anonymous"></script>
	<!-- <script src="/static/js/libs/underscore.min.js"></script> -->
	<!-- <script src="/static/js/libs/backbone.min.js"></script> -->
	<!-- <script src="/static/js/libs/sweetalert.min.js"></script> -->

	{% block scripts %}{% endblock %}
</body>
</html>