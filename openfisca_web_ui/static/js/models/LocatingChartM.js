define([
	'jquery',
	'underscore',
	'backbone',

	'chartsM',
	'helpers',

	'json!vingtilesD'
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
			this.set('vingtiles', _.findWhere(vingtiles, {id: this.code}));
			this.listenTo(chartsM, 'change:apiData', this.parseApiData);
		},
		parseApiData: function() {
			this.set('data',
				chartsM.get('simulationStatus') === 'done' ?
					helpers.findDeep(chartsM.get('apiData').value, {code: this.code}) :
					null
			);
		},
	});

	return LocatingChartM;
});
