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
			'': 'waterfallChart'
		},
		initialize: function () {
			Backbone.history.start();
		},
		waterfallChart: function () {
			appV.render({
				chart: 'waterfall'
			});
		},
		locatingChart: function () {
			appV.render({
				chart: 'locating'
			});
		},
		distributionChart: function () {
			appV.render({
				chart: 'distribution'
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
	
