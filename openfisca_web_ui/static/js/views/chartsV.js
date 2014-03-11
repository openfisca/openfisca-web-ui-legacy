define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'appconfig',
	'backendServiceM',
	'DistributionChartV',
	'LocatingChartV',
	'VisualizationsPaneV',
	'WaterfallChartV',
	'hbs!templates/chartsTabs'
	],
	function ($, _, Backbone, d3, appconfig, backendServiceM, DistributionChartV, LocatingChartV, VisualizationsPaneV,
		WaterfallChartV, chartsTabsT) {
		'use strict';

		var enableLocatingChart = !! appconfig.enabledModules.locatingChart;
		var viewClassByChartName = {
			distribution: DistributionChartV,
			visualizations: VisualizationsPaneV,
			waterfall: WaterfallChartV
		};
		if (enableLocatingChart) {
			viewClassByChartName.locating = LocatingChartV;
		}

		var AppV = Backbone.View.extend({
			currentChildView: null,
			el: '#chart-wrapper',
			events: {
				'click a[data-toggle="tab"]': 'onTabClicked',
				'shown.bs.tab a[data-toggle="tab"]': 'onTabShown'
			},
			initialize: function () {
				this.$el.html(chartsTabsT({enableLocatingChart: enableLocatingChart}));
				this.$overlay = this.$el.find('.overlay');
				this.listenTo(backendServiceM, 'change:simulationInProgress', this.updateOverlay);
				this.updateOverlay();
			},
			onTabClicked: function(evt) {
				evt.preventDefault();
			},
			onTabShown: function(evt) {
				window.location.hash = $(evt.target).attr('href');
			},
			render: function (chartName) {
				if (this.$el.find('.nav .active').length === 0) {
					this.$el.find('.nav a[href="#' + chartName + '"]').tab('show');
				}
				this.$el.find('.tab-pane.active').empty();
				this.currentChildView = new viewClassByChartName[chartName]({el: this.$el.find('#' + chartName)});
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

		var appV = new AppV();
		return appV;

	}
);
