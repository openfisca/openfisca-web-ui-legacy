define([
	'jquery',
	'underscore',
	'backbone',
	'sticky',

	'appconfig',
	'chartM',
	'DistributionChartV',
	'VisualizationsPaneV',
	'WaterfallChartV',
	'hbs!templates/chartsTabs'
],
function ($, _, Backbone, sticky, appconfig, chartM, DistributionChartV, VisualizationsPaneV, WaterfallChartV,
	chartsTabsT) {
	'use strict';

	var enableLocatingChart = !! appconfig.enabledModules.locatingChart;
	var viewClassByChartName = {
		distribution: DistributionChartV,
		visualizations: VisualizationsPaneV,
		waterfall: WaterfallChartV
	};
	if (enableLocatingChart) {
		require(['LocatingChartV'], function(LocatingChartV) {
			viewClassByChartName.locating = LocatingChartV;
		});
	}

	var ChartV = Backbone.View.extend({
		currentChildView: null,
		el: '#chart-wrapper',
		events: {
			'show.bs.tab a[data-toggle="tab"]': 'onTabShow',
		},
		model: chartM,
		initialize: function () {
			this.$el.html(chartsTabsT({enableLocatingChart: enableLocatingChart}));
			if ($(window).width() >= 768) {
				this.$el.sticky();
			}
			this.$overlay = this.$el.find('.overlay');
			this.listenTo(this.model, 'change:currentChartName', this.render);
			this.listenTo(this.model, 'change:simulationInProgress', this.updateOverlay);
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
				if (this.currentChildView !== null) {
					this.currentChildView.remove();
				}
				var $tabPane = $('<div>', {'class': 'active tab-pane'});
				this.$el.find('.tab-content').append($tabPane);
				this.currentChildView = new viewClassByChartName[chartName]({el: $tabPane});
				this.currentChildView.render();
			}
			return this;
		},
		updateOverlay: function() {
			var simulationInProgress = this.model.get('simulationInProgress');
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
	return chartV;

});
