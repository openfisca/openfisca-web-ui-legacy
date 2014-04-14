define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
	'helpers',

	'json!vingtilesD'
],
function ($, _, Backbone, backendServiceM, helpers, vingtiles) {
	'use strict';

	var LocatingChartM = Backbone.Model.extend({
		code: null,
		defaults: {
			data: null,
			vingtiles: null,
		},
		initialize: function(options) {
			this.code = options.code;
			this.listenTo(backendServiceM, 'change:apiData', this.parseApiData);
		},
		parseApiData: function() {
			this.set({
				data: helpers.findDeep(backendServiceM.get('apiData').value, {code: this.code}),
				vingtiles: _.findWhere(vingtiles, {id: this.code}),
			});
		},
	});

	return LocatingChartM;
});
