define([
	'underscore',
	'backbone',

	'DetailChartV',
	'LocatingChartV',

	],
	function (_, Backbone, DetailChartV, LocatingChartV) {

		var appV,
			AppV = Backbone.View.extend({
			events: {},
			el: '#chart-wrapper',
			
			initialize: function () {
				console.info('AppView initialized');
			},
			render: function (args) {
				var args = args || {};

				switch(args.chart) {
					case 'detail':
						if(_.isUndefined(this.detailChart)) this.detailChart = new DetailChartV(this);
						else this.$el.html(this.detailChart.render().$el);

						break;
					case 'locating':
						if(_.isUndefined(this.locatingChart)) this.locatingChart = new LocatingChartV(this);
						else this.$el.html(this.locatingChart.render().$el);

						break;
					default:
						console.error('_Error : No chart selected when called AppV.render');
				};
				return this;
			}
		});
		appV = new AppV();
		return appV;
	}
);
