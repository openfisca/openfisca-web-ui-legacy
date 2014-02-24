define([
	'jquery',
	'underscore',
	'backbone',
	'x-editable',

	'backendServiceM',
	],
	function ($, _, Backbone, xEditable, backendServiceM) {

		var endsWith = function(str, suffix) { return str.indexOf(suffix, str.length - suffix.length) !== -1; };

		var SituationFormV = Backbone.View.extend({
			currentTabName: 'familles',
			el: 'form[name="situation"]',
			events: {
				'change :input': 'onInputChange',
				'click :input.add': 'onAddButtonClicked',
				'keypress :input': 'onKeyPress'
			},
			model: backendServiceM,
			submitTriggered: false,
			initialize: function() {
				this.$el.find('.x-editable').editable({
					url: _.bind(function(data) {
						var $hidden = this.$el.find('[name="' + data.name + '"]');
						$hidden.val(data.value);
						var formDataStr = this.$el.serialize();
						this.submit(formDataStr, false);
					}, this)
				});
				this.listenTo(this.model, 'change:formData', this.render);
			},
			onInputChange: function(evt) {
				var $input = $(evt.target);
				if ($input.parents('.main-category').length) {
					var formDataStr = this.$el.serialize();
					this.submit(formDataStr, false);
				}
			},
			onAddButtonClicked: function(evt) {
				evt.preventDefault();
				var doReloadForm = false;
				var formDataStr = this.$el.serialize();
				// Add clicked button to form data.
				var $button = $(evt.target);
				var name = $button.attr('name');
				if ( ! _.isUndefined(name)) {
					doReloadForm = true;
					var value = $button.attr('value');
					formDataStr += '&' + name + '=' + value;
				}
				this.submit(formDataStr, doReloadForm);
			},
			onKeyPress: function(evt) {
				if (evt.keyCode === 13 && $(evt.target).parents('.editableform').length == 0) {
					evt.preventDefault();
					var formDataStr = this.$el.serialize();
					var doReloadForm = endsWith(evt.target.name, '.prenom');
					this.submit(formDataStr, doReloadForm);
				}
			},
			render: function() {
				var formData = this.model.get('formData');
				if ( ! _.isUndefined(formData)) {
					this.$el.html(formData);
				}
				return this;
			},
			submit: function(formDataStr, doReloadForm) {
				if (this.submitTriggered) {
					return;
				}
				this.submitTriggered = true;
				this.model.saveForm(this.currentTabName, formDataStr, _.bind(function() {
					this.submitTriggered = false;
					if (doReloadForm) {
						this.model.fetchForm();
					} else {
						this.model.simulate();
					}
				}, this));
			}
		});

		return SituationFormV;

	}
);
