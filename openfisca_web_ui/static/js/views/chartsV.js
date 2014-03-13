define([
	'jquery',
	'backbone',

	'appconfig',
	'backendServiceM',
	'chartM',
	'DistributionChartV',
	'VisualizationsPaneV',
	'WaterfallChartV',
	'hbs!templates/chartsTabs'
	],
	function ($, Backbone, appconfig, backendServiceM, chartM, DistributionChartV, VisualizationsPaneV, WaterfallChartV,
		chartsTabsT) {
		'use strict';

		var enableLocatingChart = !! appconfig.enabledModules.locatingChart;
		var viewClassByChartName = {
			distribution: DistributionChartV,
			visualizations: VisualizationsPaneV,
			waterfall: WaterfallChartV
		};

		var ChartV = Backbone.View.extend({
			currentChildView: null,
			el: '#chart-wrapper',
			events: {
				'show.bs.tab a[data-toggle="tab"]': 'onTabShow'
			},
			model: chartM,
			initialize: function () {
				this.$el.html(chartsTabsT({enableLocatingChart: enableLocatingChart}));
				this.$overlay = this.$el.find('.overlay');

				/* À passer dans chartM ! */
				this.listenTo(backendServiceM, 'change:simulationInProgress', this.updateOverlay);

				this.listenTo(this.model, 'change:currentChartName', this.render);
								
				this.updateOverlay();
			},
			onTabShow: function(evt) {
				window.location.hash = $(evt.target).attr('href');
			},
			render: function () {
				var chartName = this.model.get('currentChartName');
				if (chartName in viewClassByChartName) {
					if (this.$el.find('.nav .active').length === 0) {
						this.$el.find('.nav a[href="#' + chartName + '"]').tab('show');
					}
					this.$el.find('.tab-pane.active').empty();
					this.currentChildView = new viewClassByChartName[chartName]({el: this.$el.find('#' + chartName)});
				}
				return this;
			},
			updateOverlay: function() {
				var simulationInProgress = backendServiceM.get('simulationInProgress');
				var $svg = this.$el.find('svg');
				if (simulationInProgress) {
					$svg.css('opacity', 0.1);
					this.$overlay.show();
				} else {
					$svg.css('opacity', 1);
					this.$overlay.hide();
				}
			}
		});

		var chartV = new ChartV();
		if (enableLocatingChart) {
			require(['LocatingChartV'], function(LocatingChartV) {
				viewClassByChartName.locating = LocatingChartV;
				chartV.render('locating');
			});
		}
		return chartV;

	}
);
