define([
	'jquery',
	'underscore',
	'backbone',
	'sticky',

	'appconfig',
	'chartM',
	'DistributionChartV',
	'IframeChartV',
	'LocatingChartV',
	'visualizationsServiceM',
	'WaterfallChartV',

	'hbs!templates/charts'
],
function ($, _, Backbone, sticky, appconfig, chartM, DistributionChartV, IframeChartV, LocatingChartV,
	visualizationsServiceM, WaterfallChartV, chartsT) {
	'use strict';

	var enableLocatingChart = appconfig.enabledModules.locatingChart;
	var viewClassByChartName = {
		distribution: DistributionChartV,
		locating: LocatingChartV,
		waterfall: WaterfallChartV,
	};

	var ChartV = Backbone.View.extend({
		currentChildView: null,
		el: '#charts-wrapper',
		events: {
			'change select': 'changeChart',
		},
		model: chartM,
		initialize: function () {
			this.listenTo(visualizationsServiceM, 'change:visualizations', this.render);
			this.listenTo(this.model, 'change:currentChartName', this.render);
			this.listenTo(this.model, 'change:simulationInProgress', this.updateOverlay);
			if ($(window).width() >= 768) {
				this.$el.sticky({
					getWidthFrom: this.$el.parent(),
					topSpacing: 10,
				});
			}
		},
		changeChart: function (evt) {
			Backbone.history.navigate($(evt.target).val(), {trigger: true});
		},
		chartsData: function() {
			var chartsData = [];
			if (enableLocatingChart) {
				chartsData.push({label: 'Se situer', value: 'locating'});
			}
			chartsData = chartsData.concat([
				{label: 'Répartition', value: 'distribution'},
				{label: 'Cascade', value: 'waterfall'},
			]);
			var otherVisualizations = visualizationsServiceM.get('visualizations');
			if (otherVisualizations) {
				_.each(otherVisualizations, function(item) {
					chartsData.push({label: item.title, value: item.slug});
				});
			}
			var currentChartData = _.findWhere(chartsData, {value: this.model.get('currentChartName')});
			if ( ! _.isUndefined(currentChartData)) {
				currentChartData.active = true;
			}
			return chartsData;
		},
		render: function () {
			this.$el.html(chartsT({charts: this.chartsData()}));
			if (this.currentChildView !== null) {
				this.currentChildView.remove();
			}
			var $chartWrapper = this.$el.find('.chart-wrapper');
			var currentChartName = this.model.get('currentChartName');
			if (currentChartName in viewClassByChartName) {
				this.currentChildView = new viewClassByChartName[currentChartName]({el: $chartWrapper});
				this.currentChildView.render();
			} else {
				this.currentChildView = new IframeChartV({el: $chartWrapper});
				this.currentChildView.render(currentChartName);
			}
			return this;
		},
		updateOverlay: function() {
			var simulationInProgress = this.model.get('simulationInProgress');
			var $overlay = this.$el.find('.overlay');
			var $svg = this.$el.find('svg');
			if (simulationInProgress) {
				$svg.css('opacity', 0.1);
				$overlay.show();
			} else {
				$svg.css('opacity', 1);
				$overlay.hide();
			}
		}
	});

	var chartV = new ChartV();
	return chartV;

});
