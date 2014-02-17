define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'WaterfallChartV',
	'LocatingChartV',
	'DistributionChartV'
	],
	function ($, _, Backbone, d3, WaterfallChartV, LocatingChartV, DistributionChartV) {

		var AppV = Backbone.View.extend({
			events: {},
			el: '#chart-wrapper',
			width: null,
			height: null,
			charts: {},
			initialize: function () {
				console.info('AppView initialized');
				this.svg = d3.select(this.el).append('svg');
				$(window).on('resize', $.proxy(this.updateDimensions, this));
				this.updateDimensions();
				this.$el.prepend('\
<div id="chart-menu">\
	<ul class="nav nav-tabs">\
		<li class="active">\
			<a data-target="cascade" data-toggle="tab" href="#!/cascade">Cascade</a>\
		</li>\
		<li>\
			<a data-target="repartition" data-toggle="tab" href="#!/repartition">Répartition</a>\
		</li>\
	</ul>\
</div>');
				this.$el.find('a[data-toggle="tab"]').on('shown.bs.tab', function(evt) {
					var href = $(evt.target).attr('href');
					window.location.hash = href;
				});
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
			},
			updateDimensions: function() {
				this.width = this.$el.width();
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
