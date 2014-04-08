define([
	'jquery',
	'underscore',
	'backbone',
	'x-editable',

	'backendServiceM',
	'situationFormM',
],
function ($, _, Backbone, xEditable, backendServiceM, situationFormM) {
	'use strict';

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
			'click :input.delete': 'onDeleteButtonClicked',
			'click .modal button': 'onModalButtonClicked',
			'click button.simulate': 'onSimulateButtonClicked',
			'keypress :input': 'onKeyPress'
		},
		model: situationFormM,
		initialize: function() {
			this.setupXeditable();
			this.listenTo(this.model, 'change:apiErrors', this.renderApiErrors);
			this.listenTo(this.model, 'change:apiSuggestions', this.renderApiSuggestions);
			this.listenTo(this.model, 'change:formErrors', this.onFormErrors);
			this.listenTo(this.model, 'change:formHtml', this.renderFormHtml);
			this.listenTo(backendServiceM, 'change:formSaveErrors', this.onFormSaveErrors);
		},
		formDataStr: function() {
			return this.$el.find('form[name="situation"]').serialize();
		},
		onAddButtonClicked: function(evt) {
			evt.preventDefault();
			var reloadForm = false;
			var formDataStr = this.formDataStr();
			// Add clicked button to form data (add or delete buttons).
			var $button = $(evt.target);
			var name = $button.attr('name');
			if ( ! _.isUndefined(name)) {
				var value = $button.attr('value');
				formDataStr += '&' + name + '=' + value;
				reloadForm = true;
			}
			this.model.save(formDataStr)
				.then(_.bind(function() {
					if (reloadForm) {
						this.model.fetch();
					}
				}, this));
		},
		onDeleteButtonClicked: function(evt) {
			// TODO i18n
			if ( ! confirm('Supprimer ?')) { // jshint ignore:line
				evt.preventDefault();
			}
		},
		onFormErrors: function() {
			// TODO i18n
			alert('Désolé, une erreur est survenue lors de l\'affichage du formulaire. La page va être rechargée.');
			document.location.reload();
		},
		onFormSaveErrors: function() {
			// TODO i18n
			alert('Désolé, une erreur est survenue lors de la sauvegarde du formulaire. La page va être rechargée.');
			document.location.reload();
		},
		onInputChange: _.debounce(function(evt) {
			var $input = $(evt.target);
			if ($input.parents('.modal').length === 0 && $input.parents('.editableform').length === 0) {
				this.model.save(this.formDataStr());
			}
		}, debounceDelay),
		onKeyPress: function(evt) {
			var $target = $(evt.target);
			if (evt.keyCode === 13 && $target.parents('.editableform').length === 0) {
				evt.preventDefault();
				var reloadForm = false;
				var formDataStr = this.formDataStr();
				if (endsWith(evt.target.name, '.prenom')) {
					reloadForm = true;
				}
				var $modal = $target.parents('.modal');
				if ($modal.length !== 0) {
					$modal.modal('hide');
				}
				this.model.save(formDataStr)
					.then(_.bind(function() {
						if (reloadForm) {
							this.model.fetch();
						}
					}, this));
			}
		},
		onModalButtonClicked: function() {
			this.model.save(this.formDataStr());
		},
		onSimulateButtonClicked: function(evt) {
			evt.preventDefault();
			this.model.save(this.formDataStr());
		},
		renderApiErrors: function() {
			this.renderApiDataTestCase(this.model.get('apiErrors'), 'error');
			return this;
		},
		renderApiSuggestions: function() {
			this.renderApiDataTestCase(this.model.get('apiSuggestions'), 'suggestion');
			return this;
		},
		renderApiDataTestCase: function(testCase, annotationType) {
			var className = {error: 'has-error', suggestion: 'has-warning'}[annotationType];
			if (testCase === null) {
				this.$el
					.find('.help-block.' + annotationType).remove().end()
					.find('.' + className).removeClass(className).end();
			} else {
				if ('foyers_fiscaux' in testCase) {
					_.each(testCase.foyers_fiscaux, function(foyerFiscal, foyerFiscalIdx) { // jshint ignore:line
						var $foyerFiscal = this.$el.find('[id^="collapse-foyer-fiscal"]').eq(foyerFiscalIdx);
						if ('declarants' in foyerFiscal) {
							_.each(foyerFiscal.declarants, function(errorMessage, declarantIdx) {
								var $declarant = $foyerFiscal.find('.individu').eq(declarantIdx);
								$declarant
									.addClass(className)
									.append($('<p>', {'class': 'help-block ' + annotationType, text: errorMessage}));
							}, this);
						}
						if ('personnes_a_charge' in foyerFiscal) {
							_.each(foyerFiscal.personnes_a_charge, function(errorMessage, personneAChargeIdx) { // jshint ignore:line
								var $personneACharge = $foyerFiscal.find('.individu').eq(personneAChargeIdx);
								$personneACharge
									.addClass(className)
									.append($('<p>', {'class': 'help-block ' + annotationType, text: errorMessage}));
							}, this);
						}
					}, this);
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
								$individu = this.$el.find('[id^="collapse-individu-"]');
							} else {
								$individu = this.$el.find('#collapse-individu-' + individuId);
							}
							$individu.find(':input[name$=".' + fieldName + '"]')
								.call(function() {
									var $this = $(this);
									var tagName = $this.prop('tagName').toLowerCase();
									if (tagName === 'input') {
										$this.attr('placeholder', fieldValue);
									} else if (tagName === 'select') {
										var $option = $this.find('option:selected');
										$option.text($option.text() + ' ' +
											$this.find('option[value="' + fieldValue + '"]').text());
									}
								})
								.tooltip({
									placement: 'top',
									// TODO i18n
									title: 'Valeur suggérée utilisée par la simulation',
									toggle: 'tooltip'
								})
								.parents('.form-group')
									.addClass(className);
						}, this);
					}, this);
				}
			}
			return this;
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
					this.model.save(this.formDataStr());
				}, this)
			});
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
});
