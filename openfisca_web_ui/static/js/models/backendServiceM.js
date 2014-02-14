define([
	'jquery',
	'backbone',
	'appconfig'
	],
	function ($, Backbone, appconfig) {
		var BackendServiceM = Backbone.Model.extend({
			events: {},
			defaults: {
				apiData: {},
				formData: {}
			},
			simulateUrlPath: appconfig.api.urls.simulate,
			startTabUrlPath: '/familles',
			currentTabUrlPath: null,

			initialize: function () {
				this.fetchForm(this.startTabUrlPath);
			},
			fetchForm: function(tabUrlPath) {
				$.ajax({
					context: this,
					url: tabUrlPath
				})
				.done(function(data) {
					console.log('fetchForm done');
					this.set('formData', data);
					this.currentTabUrlPath = tabUrlPath;
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.log('fetchForm fail');
					console.error(jqXHR, textStatus, errorThrown);
				});
			},
			simulate: function() {
				$.ajax({
					context: this,
					url: this.simulateUrlPath
				})
				.done(function(data) {
					console.log('simulate done');
					if (data.errors) {
						alert('Wrong simulation params');
					} else {
						var result = data.output.value[0];
						if (result) {
							this.set('apiData', result);
						} else {
							alert('Could not retrieve simulation result');
						}
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('simulate fail', jqXHR, textStatus, errorThrown);
					alert('Simulation error');
				});
			},
			validateForm: function(data, callback) {
				$.ajax({
					url: this.currentTabUrlPath,
					data: data,
					type: 'POST',
					context: this,
				})
				.done(function(data) {
					console.log('validateForm done');
					this.set('formData', data);
					$.proxy(callback, this)();
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('validateForm fail', jqXHR, textStatus, errorThrown);
					this.set('formData', data);
				});
			}
		});
		var backendServiceM = new BackendServiceM();
		return backendServiceM;
	}
);
