define([
	'backbone',

	'appconfig',
	'chartM'
], function (Backbone, appconfig, chartM) {
	'use strict';

	var enableLocatingChart = appconfig.enabledModules.locatingChart;
	var router = null;
	var routes = {
		'*chartSlug': 'chart',
	};
	if (enableLocatingChart) {
		routes.locating = 'locatingChart';
	}

	var Router = Backbone.Router.extend({
		routes: routes,
		initialize: function () {
			Backbone.history.start();
		},
		chart: function (chartSlug) {
			if (chartSlug === null) {
				chartSlug = enableLocatingChart ? 'locating' : 'waterfall';
			}
			chartM.changeChart(chartSlug);
		},
	});

	function init () {
		if (router === null) {
			router = new Router();
		}
		return router;
	}

	return {init: init};

});
