define([
	'backbone',

	'appconfig',
	'chartsM'
], function (Backbone, appconfig, chartsM) {
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
				chartSlug = enableLocatingChart ? 'revdisp' : 'waterfall';
			}
			chartsM.changeChart(chartSlug);
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
