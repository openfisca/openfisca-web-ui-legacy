define([
	'backbone',

	'chartsV'
], function (Backbone, chartsV) {

	var router = null;

	function init () {
		if (router === null) {
			router = new Router();
		}
		return router;
	}

	var Router = Backbone.Router.extend({
		routes: {
			'': 'defaultChart',
			'cascade': 'waterfallChart',
			'répartition': 'distributionChart',
			'se-situer': 'locatingChart'
		},
		initialize: function () {
			Backbone.history.start();
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
		}
	});

	return {init: init};

});
