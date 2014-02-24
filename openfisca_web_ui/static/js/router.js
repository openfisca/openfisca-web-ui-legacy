define([
	'backbone',

	'appV'
], function (Backbone, appV) {

	var router = null,
		Router = Backbone.Router.extend({
		routes: {
			'!/cascade': 'waterfallChart',
			'!/se-situer': 'locatingChart',
			'!/repartition': 'distributionChart',

			// '*path': 'error404',
			'': 'locatingChart'
		},
		initialize: function () {
			Backbone.history.start();
		},
		waterfallChart: function () {
			appV.render({
				chart: 'waterfall',
				fr_chart: 'cascade'
			});
		},
		locatingChart: function () {
			appV.render({
				chart: 'locating',
				fr_chart: 'se-situer'
			});
		},
		distributionChart: function () {
			appV.render({
				chart: 'distribution',
				fr_chart: 'repartition'
			});
		},
		error404: function () {

		}
	});

	return {
		init: function () {
			if(null == router) router = new Router();
			return router;
		}
	};
});
	
