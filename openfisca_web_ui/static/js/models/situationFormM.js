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
		parseApiData: function () {
			var apiData = backendServiceM.get('apiData');
			if ('errors' in apiData) {
				this.set('apiErrors', apiData.errors[0].scenarios[0].test_case);
			}
			if ('suggestions' in apiData) {
				this.set('apiSuggestions', apiData.suggestions.scenarios[0].test_case);
			}
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
		save: function(data, callback) {
			return backendServiceM.saveForm(data, callback);
		}
	});

	var situationFormM = new SituationFormM();
	return situationFormM;
});
