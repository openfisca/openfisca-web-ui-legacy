define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'appconfig',
	'WaterfallChartV',
	'LocatingChartV',
	'DistributionChartV',
	'hbs!templates/chartsTabs'
	],
	function ($, _, Backbone, d3, appconfig, WaterfallChartV, LocatingChartV, DistributionChartV, chartsTabsT) {

		var AppV = Backbone.View.extend({
			events: {},
			el: '#chart-wrapper',
			fragmentByChartName: {
				'distribution': 'répartition',
				'locating': 'se-situer',
				'waterfall': 'cascade'
			},
			width: null,
			height: null,
			initialize: function () {
				$(window).on('resize', $.proxy(this.updateDimensions, this));
				this.updateDimensions();
				this.$el
					.html(chartsTabsT({enableLocatingChart: appconfig.enabledModules.locatingChart}))
					.find('a[data-toggle="tab"]').on('shown.bs.tab', function(evt) {
						var href = $(evt.target).attr('href');
						window.location.hash = href;
					});
			},
			render: function (chartName) {
				if (_.isUndefined(chartName)) {
					chartName = appconfig.enabledModules.locatingChart ? 'locating' : 'waterfall';
				}
				/* Switch menu */
				if(this.$el.find('.active').length === 0) {
					this.$el.find('.nav a[href="#' + this.fragmentByChartName[chartName] + '"]')
						.parent('li').addClass('active');
				}

				if(!_.isUndefined(this.chart)) this.outTransition();

				switch(chartName) {
					case 'waterfall':
						this.chart = new WaterfallChartV(this);
						break;
					case 'locating':
						if (appconfig.enabledModules.locatingChart) {
							this.chart = new LocatingChartV(this);
						}
						break;
					case 'distribution':
						this.chart = new DistributionChartV(this);
						break;
//					default:
//						console.error('_Error : No chart selected when called AppV.render');
				}
				return this;
			},
			outTransition: function () {
	            this.chart._remove();

	            $('svg').remove();
				this.chart.model.destroy();
			},
			updateDimensions: function() {
				this.width = Math.min(this.$el.width(), 1000);
				this.height = this.width * 0.66;
				this.$el.find('svg')
					.attr('width', this.width)
					.attr('height', this.height);
			}
		});

		var appV = new AppV();
		return appV;

	}
);
