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
			apiErrors: null,
			apiSuggestions: null,
			formErrors: null,
			formHtml: null,
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
			if (apiData === null) {
				this.set({apiErrors: null, apiSuggestions: null});
			} else {
				this.set({
					apiErrors: 'errors' in apiData ?
						apiData.errors[0].scenarios[0].test_case : // jshint ignore:line
						null,
					apiSuggestions: 'suggestions' in apiData ?
						apiData.suggestions.scenarios[0].test_case // jshint ignore:line
						: null
				});
			}
		},
		parseFormData: function () {
			var formData = backendServiceM.get('formData');
			if (formData === null) {
				this.set({formErrors: null, formHtml: null});
			} else if ('errors' in formData) {
				this.set({formErrors: formData.errors.situation, formHtml: null});
			} else if ('html' in formData) {
				this.set({formErrors: null, formHtml: formData.html});
			}
		},
		save: function(data) {
			return backendServiceM.saveForm(data);
		}
	});

	var situationFormM = new SituationFormM();
	return situationFormM;
});
