define([
	'backbone',

	'appconfig',
	'chartsV'
], function (Backbone, appconfig, chartsV) {

	var router = null;

	var enableLocatingChart = !! appconfig.enabledModules.locatingChart;

	function init () {
		if (router === null) {
			router = new Router();
		}
		return router;
	}

	var routes = {
		'': 'defaultChart',
		'cascade': 'waterfallChart',
		'répartition': 'distributionChart',
		'se-situer': enableLocatingChart ? 'locatingChart' : 'default',
		'visualisations': 'visualizationsChart',
		'*fragment': 'default'
	};

	var Router = Backbone.Router.extend({
		routes: routes,
		initialize: function () {
			Backbone.history.start();
		},
		default: function() {
			this.navigate('', {replace: true, trigger: true});
		},
		defaultChart: function () {
			chartsV.render();
		},
		distributionChart: function () {
			chartsV.render('distribution');
		},
		locatingChart: function () {
			chartsV.render('locating');
		},
		waterfallChart: function () {
			chartsV.render('waterfall');
		},
		visualizationsChart: function () {
			chartsV.render('visualisations');
		}
	});

	return {init: init};

});
