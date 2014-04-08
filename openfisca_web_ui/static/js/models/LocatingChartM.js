define([
	'jquery',
	'underscore',
	'backbone',

	'chartsM',
	'helpers',

	'json!data/vingtiles.json'
],
function ($, _, Backbone, chartsM, helpers, vingtiles) {
	'use strict';

	var LocatingChartM = Backbone.Model.extend({
		code: null,
		defaults: {
			data: null,
			vingtiles: null,
		},
		initialize: function(options) {
			this.code = options.code;
			this.listenTo(chartsM, 'change:apiData', this.parseApiData);
		},
		parseApiData: function() {
			this.set({
				data: helpers.findDeep(chartsM.get('apiData'), {code: this.code}),
				vingtiles: _.findWhere(vingtiles, {id: this.code}),
			});
		},
	});

	return LocatingChartM;
});
