define([
	'appV',

	'jquery',
	'underscore',
	'backbone',
], function (appV, a, b, c) {

	var router = null,
		Router = Backbone.Router.extend({
		routes: {
			'!/vue-d-ensemble': 'detailChart',
			'!/se-situer': 'locatingChart',

			// '*path': 'error404',
			'': 'detailChart'
		},
		initialize: function () {
			Backbone.history.start();
		},
		detailChart: function () {
			appV.render({
				chart: 'detail'
			});
		},
		locatingChart: function () {
			appV.render({
				chart: 'locating'
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
	