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
			},
			events: {},
			urlPaths: appconfig.api.urls,

			initialize: function () {
				this.simulate();
			},
			saveForm: function(tabName, data, callback) {
				$.ajax({
					context: this,
					data: data,
					dataType: 'json',
					type: 'POST',
					url: this.urlPaths.form
				})
				.done(function(data, textStatus, jqXHR) {
					if (data !== null && ! _.isUndefined(data.errors)) {
						console.error('saveForm errors', data);
					}
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
				});
			}
		});
		var backendServiceM = new BackendServiceM();
		return backendServiceM;
	}
);
