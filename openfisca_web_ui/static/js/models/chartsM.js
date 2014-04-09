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
			this.listenTo(backendServiceM, 'change:formData', this.simulate);
		},
		changeChart: function (chartName) {
			this.set('currentChartSlug', chartName);
			this.simulate(chartName);
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
