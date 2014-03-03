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
			events: {},
			urlPaths: appconfig.api.urls,

			initialize: function () {
				this.simulate();
			},
			fetchForm: function() {
				return $.ajax({
					context: this,
					url: this.urlPaths.form
				})
				.done(function(data) {
					this.set('formData', {html: data});
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('fetchForm fail', jqXHR, textStatus, errorThrown);
				});
			},
			saveForm: function(data, callback) {
				return $.ajax({
					context: this,
					data: data,
					type: 'POST',
					url: this.urlPaths.form
				})
				.done(function(data, textStatus, jqXHR) {
					if (data !== null && ! _.isUndefined(data.errors)) {
						console.error('Errors in form', data.errors);
					}
					this.set('formData', data === null ? {} : data);
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
			simulate: function() {
				this.set('simulationInProgress', true);
				return $.ajax({
					context: this,
					url: this.urlPaths.simulate
				})
				.done(function(data) {
					if (data.errors) {
						var errorMessage = 'Erreur de simulation : les paramètres sont probablement incohérents.';
						alert(errorMessage);
						console.error(errorMessage, data)
					} else {
						var result = data.output.value[0];
						if ( ! _.isUndefined(result)) {
							this.set('apiData', result);
						}
					}
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
