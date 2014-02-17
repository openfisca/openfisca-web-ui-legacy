define([
	'underscore',
	'backbone',
	'd3',

	'WaterfallChartV',
	'LocatingChartV',
	'DistributionChartV'
	],
	function (_, Backbone, d3, WaterfallChartV, LocatingChartV, DistributionChartV) {

		var AppV = Backbone.View.extend({
			events: {},
			el: '#chart-wrapper',

			width: 980,
			height: 800,
			charts: {},
			
			initialize: function () {
				console.info('AppView initialized');

				/* Init svg */
				this.svg = d3.select(this.el).append('svg')
					.attr('width', this.width)
					.attr('height', this.height);

				this.$el.prepend('<div id="chart-menu"><a href="#!/vue-d-ensemble">Waterfall</a><a href="#!/repartition">Répartition</a></div>');
			},
			render: function (args) {
				var args = args || {};

				if(!_.isUndefined(this.chart)) this.outTransition();

				switch(args.chart) {
					case 'waterfall':
						this.chart = new WaterfallChartV(this);

						break;
					case 'locating':
						this.chart = new LocatingChartV(this);

						break;
					case 'distribution':
						this.chart = new DistributionChartV(this);

						break;
					default:
						console.error('_Error : No chart selected when called AppV.render');
				};
				return this;
			},
			outTransition: function () {
				this.$el.find('svg').text('');
				console.log(this.chart.$el);
				this.chart.remove();
				this.chart.model.destroy();
			}
		});
		var appV = new AppV();
		return appV;
	}
);
