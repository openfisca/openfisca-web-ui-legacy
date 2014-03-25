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
			formDataStr: function() {
				return this.$el.find('form[name="situation"]').serialize();
			},
			onAddButtonClicked: function(evt) {
				evt.preventDefault();
				var doReloadForm = false;
				var formDataStr = this.formDataStr();
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
					this.submit(this.formDataStr(), false);
				}
			}, debounceDelay),
			onKeyPress: function(evt) {
				if (evt.keyCode === 13 && $(evt.target).parents('.editableform').length === 0) {
					evt.preventDefault();
					var doReloadForm = endsWith(evt.target.name, '.prenom');
					this.submit(this.formDataStr(), doReloadForm);
				}
			},
			onSimulateButtonClicked: function(evt) {
				evt.preventDefault();
				this.submit(this.formDataStr(), false);
			},
			render: function() {
				var formData = this.model.get('formData');
				if (! _.isUndefined(formData.html)) {
					this.$el.html(formData.html);
					this.setupXeditable();
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
						this.submit(this.formDataStr(), false);
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
						chartM.simulate();
					}
				}, this), {silent: ! doReloadForm});
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
