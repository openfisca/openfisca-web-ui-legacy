define([
	'jquery',
	'underscore',
	'backbone',

	'appconfig',
	'chartsM',
	'DistributionChartV',
	'IframeChartV',
	'legislationsServiceM',
	'LocatingChartV',
	'situationForm',
	'testCasesServiceM',
	'visualizationsServiceM',
	'WaterfallChartV',

	'hbs!chartsT',
],
function ($, _, Backbone, appconfig, chartsM, DistributionChartV, IframeChartV, legislationsServiceM, LocatingChartV,
	situationForm, testCasesServiceM, visualizationsServiceM, WaterfallChartV, chartsT) {
	'use strict';

	if ( ! ('situationForm' in appconfig.enabledModules)) {
		return;
	}

	var enableLocatingChart = appconfig.enabledModules.locatingChart;

	var ChartV = Backbone.View.extend({
		currentChildView: null,
		el: '#charts-wrapper',
		events: {
			'change select[name="chart"]': 'onChartChange',
			'change select[name="legislation"]': 'onLegislationChange',
			'change select[name="test_case"]': 'onTestCaseChange',
			'change input[name="year"]': 'onYearChange',
		},
		model: chartsM,
		initialize: function () {
			var simulate = function() {
				var iframeVisualizationsNames = _.pluck(visualizationsServiceM.get('visualizations'), 'slug');
				if ( ! _.contains(iframeVisualizationsNames, visualizationsServiceM.get('currentChartSlug'))) {
					this.model.simulate(situationForm.get('testCaseForAPI'));
				}
			}.bind(this);
			var update = function() {
				simulate();
				this.render();
			}.bind(this);
			this.listenTo(this.model, 'change:year', simulate);
			this.listenTo(this.model, 'change:legislation', simulate);
			this.listenTo(this.model, 'change:currentChartSlug', update);
			if ( ! _.isUndefined(appconfig.enabledModules.charts)) {
				this.listenTo(visualizationsServiceM, 'change:visualizations', this.render);
			}
			this.listenTo(chartsM, 'change:simulationStatus', this.updateOverlay);
			$(window).on('resize', _.bind(this.onWindowResize, this));
		},
		buildChartsRenderData: function() {
			var data = [];
			if (enableLocatingChart) {
				data = data.concat([
					{title: 'Situateur de revenu disponible', slug: 'revdisp'},
					{title: 'Situateur de salaire imposable', slug: 'sal'},
				]);
			}
			data = data.concat([
				{title: 'Répartition', slug: 'distribution'},
				{title: 'Cascade', slug: 'waterfall'},
			]);
			var otherVisualizations = visualizationsServiceM.get('visualizations');
			if (otherVisualizations !== null) {
				data = data.concat(_.map(otherVisualizations, function(otherVisualization) {
					return _.clone(otherVisualization);
				}));
			}
			var currentChartData = _.findWhere(data, {slug: this.model.get('currentChartSlug')});
			if ( ! _.isUndefined(currentChartData)) {
				currentChartData.active = true;
			}
			return data;
		},
		onChartChange: function (evt) {
			Backbone.history.navigate($(evt.target).val(), {trigger: true});
		},
		onLegislationChange: function (evt) {
			this.model.set('legislation', $(evt.target).val());
		},
		onTestCaseChange: function (evt) {
			// TODO Configure URL.
			window.location.href = '/test_cases/' + $(evt.target).val() + '/use?redirect=' +
				window.location.pathname + window.location.hash;
		},
		onYearChange: function (evt) {
			this.model.set('year', parseInt($(evt.target).val()));
		},
		onWindowResize: function() {
			this.currentChildView.render();
		},
		render: function () {
			this.$el.html(chartsT({
				charts: this.buildChartsRenderData(),
				defaultYear: appconfig.constants.defaultYear,
				displaySaveButton: 'auth' in appconfig.enabledModules &&
					appconfig.enabledModules.auth.currentUser === null,
				isUserAuthenticated: 'auth' in appconfig.enabledModules &&
					appconfig.enabledModules.auth.currentUser !== null,
				legislations: legislationsServiceM.get('legislations') || [],
				maxYear: appconfig.constants.maxYear,
				minYear: appconfig.constants.minYear,
				testCases: testCasesServiceM.get('testCases') || [],
				year: this.model.get('year'),
			}));
			if (this.currentChildView !== null) {
				this.currentChildView.remove();
				this.currentChildView = null;
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
			var $overlay = this.$el.find('.overlay');
			var simulationStatus = chartsM.get('simulationStatus');
			var message;
			if (simulationStatus === 'in-progress') {
				message = 'Simulation en cours…';
			} else if (_.contains(['error', 'fail'], simulationStatus)) {
				message = 'Erreur de simulation';
			} else if (_.contains([null, 'done'], simulationStatus)) {
				message = null;
			}
			var $chartWrapper = this.$el.find('.chart-wrapper');
			if (message !== null) {
				$overlay.text(message);
				$chartWrapper.css('opacity', 0.1);
				$overlay.show();
			} else {
				$chartWrapper.css('opacity', 1);
				$overlay.hide();
			}
		}
	});

	var chartV = new ChartV();
	return chartV;

});
