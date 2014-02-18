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
					if ( ! _.isUndefined(callback)) {
						callback();
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
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
				.done(function(data, textStatus, jqXHR) {
					this.set('formData', data);
					if ( ! _.isUndefined(callback)) {
						callback();
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
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
