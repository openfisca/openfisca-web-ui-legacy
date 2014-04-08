define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
],
function ($, _, Backbone, backendServiceM) {
	'use strict';

	var ChartsM = Backbone.Model.extend({
		defaults: {
			apiData: null,
			currentChartSlug: null,
		},
		initialize: function () {
			this.listenTo(backendServiceM, 'change:apiData', this.parseApiData);
			this.listenTo(backendServiceM, 'change:formData', this.simulate);
		},
		changeChart: function (chartName) {
			this.set('currentChartSlug', chartName);
			this.simulate(chartName);
		},
		parseApiData: function () {
			var apiData = backendServiceM.get('apiData');
			this.set('apiData', 'errors' in apiData ? null : apiData.value, {silent: 'errors' in apiData});
		},
		simulate: function (chartName) {
			chartName = chartName || this.get('currentChartSlug');
			var options = {};
			if(chartName === 'distribution') {
				options.decomposition = 'decompositions-multiples.xml';
			}
			return backendServiceM.simulate(options);
		}
	});

	var chartsM = new ChartsM();
	return chartsM;
});
