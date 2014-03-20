define([
	'jquery',
	'underscore',
	'backbone',
	'x-editable',

	'backendServiceM',
	'chartM'
	],
	function ($, _, Backbone, xEditable, backendServiceM, chartM) {

		var debounceDelay = 100;
		var endsWith = function(str, suffix) { return str.indexOf(suffix, str.length - suffix.length) !== -1; };

		var SituationFormV = Backbone.View.extend({
			el: 'form[name="situation"]',
			events: {
				'change :input': 'onInputChange',
				'click :input.add': 'onAddButtonClicked',
				'click button.simulate': 'onSimulateButtonClicked',
				'keypress :input': 'onKeyPress'
			},
			model: backendServiceM,
			submitTriggered: false,
			initialize: function() {
				this.setupXeditable();
				this.listenTo(this.model, 'change:formData', this.render);
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
			onInputChange: _.debounce(function(evt) {
				var $input = $(evt.target);
				if ($input.parents('.modal').length === 0 && $(evt.target).parents('.editableform').length === 0) {
					var formDataStr = this.$el.serialize();
					this.submit(formDataStr, false);
				}
			}, debounceDelay),
			onKeyPress: function(evt) {
				if (evt.keyCode === 13 && $(evt.target).parents('.editableform').length === 0) {
					evt.preventDefault();
					var formDataStr = this.$el.serialize();
					var doReloadForm = endsWith(evt.target.name, '.prenom');
					this.submit(formDataStr, doReloadForm);
				}
			},
			onSimulateButtonClicked: function(evt) {
				evt.preventDefault();
				var formDataStr = this.$el.serialize();
				this.submit(formDataStr, false);
			},
			render: function() {
				var formData = this.model.get('formData');
				if ( ! _.isUndefined(formData.html)) {
					this.$el.replaceWith($(formData.html));
					this.setupXeditable();
				}
				if (_.isUndefined(formData.errors)) {
					this.$el.find('.error').remove();
				}
				return this;
			},
			setupXeditable: function() {
				this.$el.find('.x-editable').editable({
					url: _.bind(function(data) {
						var $hidden = this.$el.find('[name="' + data.name + '"]');
						$hidden.val(data.value);
						var individuId = this.$el.find('[data-name="' + data.name + '"]').data('id');
						this.updatePrenoms(individuId, data.value);
						var formDataStr = this.$el.serialize();
						this.submit(formDataStr, false);
					}, this)
				});
			},
			submit: function(formDataStr, doReloadForm) {
				if (this.submitTriggered) {
					return;
				}
				this.submitTriggered = true;
				this.model.saveForm(formDataStr, _.bind(function() {
					this.submitTriggered = false;
					var formData = this.model.get('formData');
					if (_.isUndefined(formData.errors)) {
						if (doReloadForm) {
							this.model.fetchForm();
						} else {
							chartM.simulate();
						}
					}
				}, this));
			},
			updatePrenoms: function(individuId, prenom) {
				this.$el.find('option[value="' + individuId + '"]').text(prenom);
			},
			updateDimensions: function() {
				this.width = Math.min(this.$el.width(), this.maxWidth);
				this.height = this.width * 0.66;
			}
		});

		return SituationFormV;

	}
);
