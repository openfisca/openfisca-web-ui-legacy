define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
	'parser',

	'json!data/vingtiles.json'
],
function ($, _, Backbone, backendServiceM, Parser, vingtiles) {
	'use strict';

	// TODO Rename to ChartsM.
	var ChartM = Backbone.Model.extend({
		defaults: {
			currentChartSlug: null,
			distribution_data: {}, // jshint ignore:line
			locating_data: {}, // jshint ignore:line
			simulationInProgress: false,
			source: {values: {}},
			vingtiles: vingtiles,
			waterfall_data: {} // jshint ignore:line
		},
		initialize: function () {
			this.listenTo(backendServiceM, 'change:apiData', this.parse);
			this.listenTo(backendServiceM, 'change:formData', this.simulate);
			this.listenTo(backendServiceM, 'change:simulationInProgress', _.bind(function () {
				this.set('simulationInProgress', backendServiceM.get('simulationInProgress'));
			}, this));
		},
		changeChart: function (chartName) {
			this.set('currentChartSlug', chartName);
			this.simulate(chartName);
		},
		parse: function () {
			var apiData = backendServiceM.get('apiData');
			if ('errors' in apiData) {
				// TODO i18n
				alert('Erreurs de simulation.');
			} else {
				// FIXME Do not duplicate data.
				this.set('source', $.extend(true, {}, apiData.value));
			}
		},

		/* Overiding Backbone get method : Call custom get method if exists (can pass args) */
		// TODO Remove this magic method.
		get: function (attr, args) {
			if (typeof this['get_'+attr] == 'function') {
				return this['get_'+attr](args);
			}
			return Backbone.Model.prototype.get.call(this, attr);
		},

		/* Custom get methods */
		get_waterfallData: function () { // jshint ignore:line
		/* Cleaned up, ungrouped and add parentNodes parentNodes attributes */
			return new Parser(this.get('source'))
				.clean()
				// .removeRootNode()
				.setParentNodes()
				.listChildren()
				.values();
		},
		get_distributionData: function (args) { // jshint ignore:line
			/* Par défault on renvoie la décomposition revdisp */
			args = args || {sort: 'revdisp'};
			var parser = new Parser(this.get('source'));

			if(args.sort == 'all') {
				args.sort = 'revdisp';
			}

			var _return = parser
				.clean()
				.setPositiveSort()
				.setDecompositionSort()
				.listChildren()
				.values();

			return _return;
		},
		get_locatingData: function () { // jshint ignore:line
			return new Parser(this.get('source'))
				.clean()
				.values();
		},
		get_cleanData: function () { // jshint ignore:line
			return new Parser(this.get('source'))
				.clean()
				.values();
		},
		simulate: function (chartName) {
			chartName = chartName || this.get('currentChartSlug');
			var options = {};
			if(chartName === 'distribution') {
				options.decomposition = 'decompositions-multiples.xml';
			}
			return backendServiceM.simulate(options);
		}
	});

	var chartM = new ChartM();
	return chartM;
});
