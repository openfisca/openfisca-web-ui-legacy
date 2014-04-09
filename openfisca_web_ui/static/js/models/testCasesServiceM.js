define([
	'jquery',
	'underscore',
	'backbone',

	'appconfig'
],
function ($, _, Backbone, appconfig) {
	'use strict';

	var TestCasesServiceM = Backbone.Model.extend({
		defaults: {
			testCases: null
		},
		initialize: function() {
			this.fetch();
		},
		fetch: function() {
			return $.ajax({
				context: this,
				type: 'GET',
				url: appconfig.enabledModules.charts.urlPaths.testCasesSearch,
			})
			.done(function(data) {
				this.set('testCases', data);
			});
		}
	});

	var testCasesServiceM = new TestCasesServiceM();
	return testCasesServiceM;
});
