define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
],
function ($, _, Backbone, backendServiceM) {
	'use strict';

	var SituationFormM = Backbone.Model.extend({
		defaults: {
			apiErrors: {},
			apiSuggestions: {},
			formErrors: {},
			formHtml: null
		},
		initialize: function () {
			this.listenTo(backendServiceM, 'change:apiData', this.parseApiData);
			this.listenTo(backendServiceM, 'change:formData', this.parseFormData);
		},
		fetch: function() {
			return backendServiceM.fetchForm();
		},
		parseApiData: function () {
			var apiData = backendServiceM.get('apiData');
			this.set(
				'apiErrors',
				'errors' in apiData ? apiData.errors[0].scenarios[0].test_case : null // jshint ignore:line
			);
			this.set(
				'apiSuggestions',
				'suggestions' in apiData ? apiData.suggestions.scenarios[0].test_case : null // jshint ignore:line
			);
		},
		parseFormData: function () {
			var formData = backendServiceM.get('formData');
			if ('errors' in formData) {
				this.set('formErrors', formData.errors.situation);
			}
			if ('html' in formData) {
				this.set('formHtml', formData.html, {silent: 'errors' in formData});
			}
		},
		save: function(data) {
			return backendServiceM.saveForm(data);
		}
	});

	var situationFormM = new SituationFormM();
	return situationFormM;
});
