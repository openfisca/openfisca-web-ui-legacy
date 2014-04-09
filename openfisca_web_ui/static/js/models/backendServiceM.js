define([
	'jquery',
	'underscore',
	'backbone',

	'appconfig'
],
function ($, _, Backbone, appconfig) {
	'use strict';

	var BackendServiceM = Backbone.Model.extend({
		defaults: {
			apiData: {},
			formData: {},
			formSaveErrors: null,
			simulationStatus: null,
		},
		fetchForm: function() {
			return $.ajax({
				context: this,
				type: 'GET',
				url: appconfig.api.urls.form
			})
			.done(function(data/*, textStatus, jqXHR*/) {
				this.set('formData', data);
			})
			.fail(function(jqXHR/*, textStatus, errorThrown*/) {
				this.set('formData', {errors: jqXHR.responseText});
			});
		},
		saveForm: function(data) {
			return $.ajax({
				context: this,
				data: data,
				type: 'POST',
				url: appconfig.api.urls.form
			})
			.done(function() {
				this.set('formSaveErrors', null);
				this.simulate();
			})
			.fail(function(jqXHR/*, textStatus, errorThrown*/) {
				this.set('formSaveErrors', {errors: jqXHR.responseText});
			});
		},
		simulate: function(options) {
			var data = {context: Date.now()};
			if ( ! _.isUndefined(options)) {
				data = $.extend(data, options);
			}
			this.set('simulationStatus', 'in-progress');
			return $.ajax({
				context: this,
				data: data,
				url: appconfig.api.urls.simulate,
			})
			.done(function(data) {
				this.set({
					apiData: data,
					simulationStatus: 'errors' in data ? 'error' : 'done',
				});
			})
			.fail(function(/* jqXHR, textStatus, errorThrown */) {
				this.set({apiData: null, simulationStatus: 'fail'});
			});
		}
	});

	var backendServiceM = new BackendServiceM();
	return backendServiceM;
});
