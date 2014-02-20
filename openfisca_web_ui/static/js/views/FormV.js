define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
	],
	function ($, _, Backbone, backendServiceM) {
		var FormV = Backbone.View.extend({
			currentTabName: 'familles',
			el: 'form[name="situation"]',
			events: {
//				'change :input': 'submit',
				'click :input[type="submit"]': 'submit',
				'keypress :input': 'submit'
			},
			model: backendServiceM,
			submitTriggered: false,

			initialize: function () { },
			submit: function(evt) {
				if (evt.type == 'keypress' && evt.keyCode !== 13) {
					return;
				}
				evt.preventDefault();
				if (this.submitTriggered) {
					return;
				}
				var formDataStr = this.$el.serialize();
				if (evt.type == 'click') {
					// Add clicked button to form data.
					var $button = $(evt.target);
					var clickedButtonName = $button.attr('name');
					if ( ! _.isUndefined(clickedButtonName)) {
						var value = $button.attr('value');
						formDataStr += '&' + clickedButtonName + '=' + value;
					}
				}
				this.submitTriggered = true;
				this.model.saveForm(this.currentTabName, formDataStr, _.bind(function() {
					this.submitTriggered = false;
					if (evt.type === 'click' && clickedButtonName) {
						// TODO Transform reload into fetchForm only.
						window.location.reload();
					} else {
						this.model.simulate();
					}
				}, this));
			}
		});
		return FormV;
	}
);
