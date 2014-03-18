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

	return {init: init};

});
