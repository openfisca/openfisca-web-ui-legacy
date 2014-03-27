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
			simulationInProgress: false,
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
			.fail(function(jqXHR, textStatus, errorThrown) {
				// TODO Show error to user.
				console.error(jqXHR, textStatus, errorThrown);
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
				this.simulate();
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				// TODO Show error to user.
				console.error(jqXHR, textStatus, errorThrown);
			});
		},
		simulate: function(options) {
			if (_.isUndefined(options)) {
				options = {};
			}
			var data = {context: Date.now()};
			if (options.axes) {
				data.axes = JSON.stringify(options.axes);
			}
			if (options.decomposition) {
				data.decomposition = JSON.stringify(options.decomposition);
			}
			this.set('simulationInProgress', true);
			return $.ajax({
				context: this,
				data: data,
				url: appconfig.api.urls.simulate,
			})
			.done(function(data) {
				this.set('apiData', data);
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				// TODO Show error to user.
				console.error(jqXHR, textStatus, errorThrown);
			}).always(function() {
				this.set('simulationInProgress', false);
			});
		}
	});

	var backendServiceM = new BackendServiceM();
	return backendServiceM;
});
