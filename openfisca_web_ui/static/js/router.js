define([
	'backbone',

	'appconfig',
	'chartsV'
], function (Backbone, appconfig, chartsV) {

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
			this.navigate(enableLocatingChart ? 'locating' : 'cascade', {replace: true, trigger: true});
		},
		distributionChart: function () {
			chartsV.render('distribution');
		},
		locatingChart: function () {
			if (enableLocatingChart) {
				chartsV.render('locating');
			}
		},
		otherCharts: function () {
			chartsV.render('other');
		},
		waterfallChart: function () {
			chartsV.render('waterfall');
		},
		visualizationsChart: function () {
			chartsV.render('visualizations');
		}
	});

	return {init: init};

});
