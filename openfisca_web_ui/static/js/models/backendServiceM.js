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
		saveForm: function(data, callback) {
			return $.ajax({
				context: this,
				data: data,
				type: 'POST',
				url: appconfig.api.urls.form
			})
			.done(function(data/*, textStatus, jqXHR*/) {
				this.set('formData', data);
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				console.error(jqXHR, textStatus, errorThrown);
			})
			.always(function() {
				if ( ! _.isUndefined(callback)) {
					callback();
				}
			});
		},
		simulate: function(data) {
			var reqData = {context: Date.now()};
			if (data.axes) {
				reqData.axes = JSON.stringify(data.axes);
			}
			if (data.decomposition) {
				reqData.decomposition = JSON.stringify(data.decomposition);
			}
			this.set('simulationInProgress', true);
			return $.ajax({
				context: this,
				url: appconfig.api.urls.simulate,
				data: reqData
			})
			.done(function(data) {
				this.set('apiData', data);
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				console.error(jqXHR, textStatus, errorThrown);
			}).always(function() {
				this.set('simulationInProgress', false);
			});
		}
	});

	var backendServiceM = new BackendServiceM();
	return backendServiceM;
});
