define([
	'backbone',

	'appconfig',
	'chartM'
], function (Backbone, appconfig, chartM) {
	'use strict';

	var enableLocatingChart = appconfig.enabledModules.locatingChart;
	var router = null;
	var routes = {
		'': 'defaultChart',
		distribution: 'distributionChart',
		other: 'otherCharts',
		visualizations: 'visualizationsChart',
		waterfall: 'waterfallChart'
	};
	if (enableLocatingChart) {
		routes.locating = 'locatingChart';
	}

	var Router = Backbone.Router.extend({
		routes: routes,
		initialize: function () {
			Backbone.history.start();
		},
		defaultChart: function () {
			chartM.changeChart(enableLocatingChart ? 'locating' : 'waterfall');
		},
		distributionChart: function () {
			chartM.changeChart('distribution');
		},
		locatingChart: function () {
			if (enableLocatingChart) {
				chartM.changeChart('locating');
			}
		},
		otherCharts: function () {
			chartM.changeChart('other');
		},
		waterfallChart: function () {
			chartM.changeChart('waterfall');
		},
		visualizationsChart: function () {
			chartM.changeChart('visualizations');
		}
	});

	function init () {
		if (router === null) {
			router = new Router();
		}
		return router;
	}

	return {init: init};

});
