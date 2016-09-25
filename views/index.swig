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
				<div class="auth-wrap">
					<div class="pin">
						<input type="text" class="pin-input input" maxlength="6"></input>
						<input type="text" class="pin-val hide"></input>
					</div>
					<div class="keypad">
						<div class="keypad-row">
							<div class="keypad-key">1</div>
							<div class="keypad-key">2</div>
							<div class="keypad-key">3</div>
						</div>
						<div class="keypad-row">
							<div class="keypad-key">4</div>
							<div class="keypad-key">5</div>
							<div class="keypad-key">6</div>
						</div>
						<div class="keypad-row">
							<div class="keypad-key">7</div>
							<div class="keypad-key">8</div>
							<div class="keypad-key">9</div>
						</div>
						<div class="keypad-row">
							<div class="keypad-key">#</div>
							<div class="keypad-key">0</div>
							<div class="keypad-key backspace-key">
								<i class="fa fa-angle-left"></i>
							</div>
						</div>
					</div>
				</div>
				<div class="door-toggle hide">
					<button class="button js-door-state-toggle">Toggle Door State</button>
				</div>
			</div>
		</div>
	</div>
</div>
{% endblock %}

{% block scripts %}
<script src="/static/js/main.js"></script>
{% endblock %}
