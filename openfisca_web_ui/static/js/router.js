define([
	'backbone',

	'appconfig',
	'chartM'
], function (Backbone, appconfig, chartM) {

	var enableLocatingChart = !! appconfig.enabledModules.locatingChart;
	var router = null;

	function init () {
		if (router === null) {
			router = new Router();
		}
		return router;
	}

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
			this.navigate(enableLocatingChart ? 'locating' : 'waterfall', {replace: true, trigger: true});
		},
		distributionChart: function () {
			chartM.set('currentChartName', 'distribution');
		},
		locatingChart: function () {
			if (enableLocatingChart) {
				chartM.set('currentChartName', 'locating');
			}
		},
		otherCharts: function () {
			chartM.set('currentChartName', 'other');
		},
		waterfallChart: function () {
			chartM.set('currentChartName', 'waterfall');
		},
		visualizationsChart: function () {
			chartM.set('currentChartName', 'visualizations');
		}
	});

	return {init: init};

});
