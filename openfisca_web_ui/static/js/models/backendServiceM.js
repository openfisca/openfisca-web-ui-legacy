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
				formData: null
			},
			events: {},
			urlPaths: appconfig.api.urls,

			initialize: function () {
				this.simulate();
			},
			fetchForm: function(tabName, callback) {
				$.ajax({
					context: this,
					url: this.urlPaths.form
				})
				.done(function(data) {
					this.set('formData', data);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('fetchForm fail', jqXHR, textStatus, errorThrown);
				})
				.always(function() {
					if ( ! _.isUndefined(callback)) {
						callback();
					}
				});
			},
			saveForm: function(tabName, data, callback) {
				$.ajax({
					context: this,
					data: data,
					type: 'POST',
					url: this.urlPaths.form
				})
				.done(function(data, textStatus, jqXHR) {
					if (data !== null && ! _.isUndefined(data.errors)) {
						console.error('Errors in form', data.errors);
						this.set('formData', data.formHtml);
					}
					if (! _.isUndefined(callback)) {
						callback();
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error(jqXHR, textStatus, errorThrown);
				});
			},
			simulate: function() {
				$.ajax({
					context: this,
					url: this.urlPaths.simulate
				})
				.done(function(data) {
					if (data.errors) {
						var errorMessage = 'Simulation error';
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
				});
			}
		});
		var backendServiceM = new BackendServiceM();
		return backendServiceM;
	}
);
