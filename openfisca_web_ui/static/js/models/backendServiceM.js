define([
	'jquery',
	'underscore',
	'backbone',
	'appconfig'
	],
	function ($, _, Backbone, appconfig) {
		var BackendServiceM = Backbone.Model.extend({
			events: {},
			defaults: {
				apiData: {},
				formData: {}
			},
			urlPaths: appconfig.api.urls,
			startTabName: 'familles',
			currentTabName: null,

			initialize: function () {
				this.fetchForm(this.startTabName, $.proxy(this.simulate, this));
			},
			fetchForm: function(tabName, callback) {
				$.ajax({
					context: this,
					url: this.urlPaths.form + '/' + tabName
				})
				.done(function(data) {
					console.log('fetchForm done');
					this.set('formData', data);
					callback();
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.log('fetchForm fail');
					console.error(jqXHR, textStatus, errorThrown);
					this.set('formData', jqXHR.responseText);
				})
				.always(function() {
					this.currentTabName = tabName;
				});
			},
			simulate: function() {
				$.ajax({
					context: this,
					url: this.urlPaths.simulate
				})
				.done(function(data) {
					console.log('simulate done');
					if (data.errors) {
						console.error('Wrong simulation params');
					} else {
						var result = data.output.value[0];
						if (_.isUndefined(result)) {
							console.error('Could not retrieve simulation result');
						} else {
							this.set('apiData', result);
						}
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('simulate fail', jqXHR, textStatus, errorThrown);
					console.error('Simulation error');
				});
			},
			validateForm: function(data, callback) {
				$.ajax({
					context: this,
					data: data,
					type: 'POST',
					url: this.urlPaths.form + '/' + this.currentTabName
				})
				.done(function(data) {
					console.log('validateForm done');
					this.set('formData', data);
					callback();
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('validateForm fail', jqXHR, textStatus, errorThrown);
					this.set('formData', jqXHR.responseText);
				});
			}
		});
		var backendServiceM = new BackendServiceM();
		return backendServiceM;
	}
);
