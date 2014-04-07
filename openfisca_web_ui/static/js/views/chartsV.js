define([
	'jquery',
	'underscore',
	'backbone',
	'sticky',

	'appconfig',
	'backendServiceM',
	'chartsM',
	'DistributionChartV',
	'IframeChartV',
	'LocatingChartV',
	'visualizationsServiceM',
	'WaterfallChartV',

	'hbs!templates/charts'
],
function ($, _, Backbone, sticky, appconfig, backendServiceM, chartsM, DistributionChartV, IframeChartV, LocatingChartV,
	visualizationsServiceM, WaterfallChartV, chartsT) {
	'use strict';

	var enableLocatingChart = appconfig.enabledModules.locatingChart;

	var ChartV = Backbone.View.extend({
		currentChildView: null,
		el: '#charts-wrapper',
		events: {
			'change select': 'changeChart',
		},
		model: chartsM,
		initialize: function () {
			this.listenTo(visualizationsServiceM, 'change:visualizations', this.render);
			this.listenTo(this.model, 'change:currentChartSlug', this.render);
			this.listenTo(backendServiceM, 'change:simulationInProgress', this.updateOverlay);
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
		chartsRenderData: function() {
			var data = [];
			if (enableLocatingChart) {
				data = data.concat([
					{label: 'Situateur de revenu disponible', value: 'revdisp'},
					{label: 'Situateur de salaire imposable', value: 'sal'},
				]);
			}
			data = data.concat([
				{label: 'Répartition', value: 'distribution'},
				{label: 'Cascade', value: 'waterfall'},
			]);
			var otherVisualizations = visualizationsServiceM.get('visualizations');
			if (otherVisualizations) {
				_.each(otherVisualizations, function(item) {
					data.push({label: item.title, value: item.slug});
				});
			}
			var currentChartData = _.findWhere(data, {value: this.model.get('currentChartSlug')});
			if ( ! _.isUndefined(currentChartData)) {
				currentChartData.active = true;
			}
			return data;
		},
		render: function () {
			this.$el.html(chartsT({
				enableSaveButton: appconfig.enabledModules.charts.enableSaveButton,
				charts: this.chartsRenderData(),
			}));
			if (this.currentChildView !== null) {
				this.currentChildView.remove();
			}
			var $chartWrapper = this.$el.find('.chart-wrapper');
			var currentChartSlug = this.model.get('currentChartSlug');
			if (_.contains(['revdisp', 'sal'], currentChartSlug)) {
				this.currentChildView = new LocatingChartV({code: currentChartSlug, el: $chartWrapper});
			} else if (currentChartSlug === 'distribution') {
				this.currentChildView = new DistributionChartV({el: $chartWrapper});
			} else if (currentChartSlug === 'waterfall') {
				this.currentChildView = new WaterfallChartV({el: $chartWrapper});
			} else {
				this.currentChildView = new IframeChartV({el: $chartWrapper});
			}
			return this;
		},
		updateOverlay: function() {
			var simulationInProgress = backendServiceM.get('simulationInProgress');
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
