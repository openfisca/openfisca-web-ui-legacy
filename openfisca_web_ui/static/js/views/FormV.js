define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
	],
	function ($, _, Backbone, backendServiceM) {
		var FormV = Backbone.View.extend({
			currentTabName: null,
			el: '#form-wrapper',
			events: {
				'change :input': 'submit',
				'click :input[type="submit"]': 'submit',
				'click .nav-tabs a': 'changeTab',
				'keypress :input': 'submit'
			},
			model: backendServiceM,
			submitTriggered: false,

			initialize: function () {
				this.currentTabName = this.model.startTabName;
				this.listenTo(this.model, 'change:formData', this.render);
			},
			changeTab: function(evt) {
				evt.preventDefault();
				var tabName = $(evt.target).data('tab-name');
				if (tabName === this.currentTabName) {
					return;
				}
				var $form = this.$el.find('form');
				var formDataStr = $form.serialize();
				this.model.saveForm(
					this.currentTabName,
					formDataStr,
					$.proxy(function() {
						this.model.fetchForm(tabName, $.proxy(this.model.simulate, this.model));
					}, this)
				);
				this.currentTabName = tabName;
			},
			render: function () {
				var data = this.model.get('formData');
				this.$el.html(data);
				this.submitTriggered = false;
				return this;
			},
			submit: function(evt) {
				if (evt.type == 'keypress' && evt.keyCode !== 13) {
					return;
				}
				evt.preventDefault();
				if (this.submitTriggered) {
					return;
				}
				this.submitTriggered = true;
				var $form = this.$el.find('form');
				var formDataStr = $form.serialize();
				if (evt.type == 'click') {
					// Add clicked button to form data.
					var $button = $(evt.target);
					var name = $button.attr('name');
					if ( ! _.isUndefined(name)) {
						var value = $button.attr('value');
						formDataStr += '&' + name + '=' + value;
					}
				}
				this.model.saveForm(
					this.currentTabName,
					formDataStr,
					$.proxy(function() {
						this.model.fetchForm(this.currentTabName, $.proxy(this.model.simulate, this.model));
					}, this)
				);
			}
		});
		return FormV;
	}
);
