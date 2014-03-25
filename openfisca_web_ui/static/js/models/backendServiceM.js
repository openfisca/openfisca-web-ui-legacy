define([
	'jquery',
	'underscore',
	'backbone',
	'appconfig'
	],
	function ($, _, Backbone, appconfig) {

		var BackendServiceM = Backbone.Model.extend({
			defaults: {
				apiData: {},
				formData: {},
				simulationInProgress: false,
			},
			urlPaths: appconfig.api.urls,

			saveForm: function(data, callback, options) {
				return $.ajax({
					context: this,
					data: data,
					type: 'POST',
					url: this.urlPaths.form
				})
				.done(function(data/*, textStatus, jqXHR*/) {
					if (data !== null && ! _.isUndefined(data.errors)) {
						console.error('Errors in form', data.errors);
					}
					this.set('formData', data, options);
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
					url: this.urlPaths.simulate,
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

	}
);
