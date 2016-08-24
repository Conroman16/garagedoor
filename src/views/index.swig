{% extends 'shared/layout.swig' %}

{% block body %}
<div class="page unloaded">
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
<script src="/static/js/main.js"></script>
{% endblock %}