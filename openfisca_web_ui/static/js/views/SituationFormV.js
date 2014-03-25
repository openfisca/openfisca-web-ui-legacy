define([
	'jquery',
	'underscore',
	'backbone',
	'x-editable',

	'situationFormM',
	'chartM'
	],
	function ($, _, Backbone, xEditable, situationFormM, chartM) {

		var debounceDelay = 100;
		var endsWith = function(str, suffix) { return str.indexOf(suffix, str.length - suffix.length) !== -1; };

		$.fn.call = function (fn, args, thisp) {
			fn.apply(thisp || this, args);
			return this; // if you want to maintain chainability -- other wise, you can move the return up one line..
		};

		var SituationFormV = Backbone.View.extend({
			events: {
				'change :input': 'onInputChange',
				'click :input.add': 'onAddButtonClicked',
				'click button.simulate': 'onSimulateButtonClicked',
				'keypress :input': 'onKeyPress'
			},
			model: situationFormM,
			submitTriggered: false,
			initialize: function() {
				this.setupXeditable();
				this.listenTo(this.model, 'change:apiErrors', this.renderApiErrors);
				this.listenTo(this.model, 'change:apiSuggestions', this.renderApiSuggestions);
				this.listenTo(this.model, 'change:formErrors', this.renderFormErrors);
				this.listenTo(this.model, 'change:formHtml', this.renderFormHtml);
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
			renderApiErrors: function() {
				this.renderApiDataTestCase(this.model.get('apiErrors'), 'has-error');
				return this;
			},
			renderApiSuggestions: function() {
				this.renderApiDataTestCase(this.model.get('apiSuggestions'), 'has-warning');
				return this;
			},
			renderApiDataTestCase: function(testCase, className) {
				if ('foyers_fiscaux' in testCase) {
					_.each(testCase.foyers_fiscaux, function(foyerFiscal, foyerFiscalIdx) {
						var $foyerFiscal = $('[id^="collapse-foyer-fiscal"]').eq(foyerFiscalIdx);
						if ('declarants' in foyerFiscal) {
							_.each(foyerFiscal.declarants, function(errorMessage, declarantIdx) {
								var $declarant = $foyerFiscal.find('.individu').eq(declarantIdx);
								$declarant
									.addClass(className)
									.append($('<p>', {'class': 'help-block', text: errorMessage}));
							});
						}
					});
				}
				if ('individus' in testCase) {
					_.each(testCase.individus, function(individu, individuId) {
						_.each(individu, function(fieldValue, fieldName) {
							if (fieldName === 'birth') {
								// Particular case for birth which is asked to user as a year by UI.
								// API treats it as a Date @type and accepts it as a Number too.
								fieldValue = fieldValue.slice(0, 4);
							}
							var $individu;
							// FIXME Quick hack to handle UUID regeneration when api data in DB is empty.
							if (_.keys(testCase.individus).length === 1) {
								$individu = $('[id^="collapse-individu-"]');
							} else {
								$individu = $('#collapse-individu-' + individuId);
							}
							$individu
								.find(':input[name$=".' + fieldName + '"]')
									.call(function() {
										var $this = $(this);
										var tagName = $this.prop('tagName').toLowerCase();
										if (tagName === 'input') {
											$this.attr('placeholder', fieldValue);
										} else if (tagName === 'select') {
											$this.val(fieldValue);
										}
									})
									.tooltip({
										placement: 'top',
										title: 'Suggested value used in simulation',
										toggle: 'tooltip'
									})
									.parents('.form-group')
										.addClass(className);
						});
					});
				}
				return this;
			},
			renderFormErrors: function() {
				console.error('renderFormErrors: not implemented');
			},
			renderFormHtml: function() {
				this.$el.html(this.model.get('formHtml'));
				this.setupXeditable();
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
				// TODO Use promises to chain calls.
				this.model.save(formDataStr, _.bind(function() {
					this.submitTriggered = false;
					chartM.simulate();
				}, this));
				// FIXME Handle full form reload problem., {silent: ! doReloadForm}
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
