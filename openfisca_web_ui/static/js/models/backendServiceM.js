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
				formData: {}
			},
			events: {},
			startTabName: 'familles',
			urlPaths: appconfig.api.urls,

			initialize: function () {
				this.fetchForm(this.startTabName, $.proxy(this.simulate, this));
			},
			buildFormPath: function(tabName) {
				return this.urlPaths.form + '/' + tabName;
			},
			fetchForm: function(tabName, callback) {
				$.ajax({
					context: this,
					url: this.buildFormPath(tabName)
				})
				.done(function(data) {
					this.set('formData', data);
					callback();
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error(jqXHR, textStatus, errorThrown, jqXHR.responseText);
				});
			},
			saveForm: function(tabName, data, callback) {
				$.ajax({
					context: this,
					data: data,
					dataType: 'json',
					type: 'POST',
					url: this.buildFormPath(tabName)
				})
				.done(function(data) {
					if (data !== null) {
						console.error('simulate API validation error', data);
					}
					this.set('formData', data);
					callback();
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('saveForm fail', jqXHR, textStatus, errorThrown, jqXHR.responseText);
				});
			},
			simulate: function() {
				$.ajax({
					context: this,
					url: this.urlPaths.simulate
				})
				.done(function(data) {
					if (data.errors) {
						console.error('simulation error', data);
					} else {
						var result = data.output.value[0];
						if (_.isUndefined(result)) {
							console.error('result is undefined', data);
						} else {
							this.set('apiData', result);
						}
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('simulate fail', jqXHR, textStatus, errorThrown, jqXHR.responseText);
				});
			}
		});
		var backendServiceM = new BackendServiceM();
		return backendServiceM;
	}
);
