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

	var ChartM = Backbone.Model.extend({
		fetched: false,
		defaults: {
			currentChartName: null,
			distribution_data: {},
			locating_data: {},
			simulationInProgress: false,
			source: {values: {}},
			vingtiles: vingtiles,
			waterfall_data: {}
		},
		initialize: function () {
			this.listenTo(backendServiceM, 'change:apiData', this.parse);
			this.listenTo(backendServiceM, 'change:formData', this.simulate);
			this.listenTo(backendServiceM, 'change:simulationInProgress', _.bind(function () {
				this.set('simulationInProgress', backendServiceM.get('simulationInProgress'));
			}, this));
		},
		parse: function () {
			// FIXME Remove "fetched". Rework asynchronisms.
			this.fetched = true;
			var apiData = backendServiceM.get('apiData');
			if ( ! ('errors' in apiData)) {
				this.set('source', $.extend(true, {}, apiData.value));
			}
		},

		/* Overiding Backbone get method : Call custom get method if exists (can pass args) */
		get: function (attr, args) {
			if (typeof this['get_'+attr] == 'function') {
				return this['get_'+attr](args);
			}
			return Backbone.Model.prototype.get.call(this, attr);
		},

		/* Custom get methods */
		get_waterfallData: function () { /* Cleaned up, ungrouped and add parentNodes parentNodes attributes */
			return new Parser(this.get('source'))
				.clean()
				// .removeRootNode()
				.setParentNodes()
				.listChildren()
				.values();
		},
		get_distributionData: function (args) {
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
		get_locatingData: function () { /* Just cleaned up */
			return new Parser(this.get('source'))
				.clean()
				.values();
		},
		get_cleanData: function () {
			return new Parser(this.get('source'))
				.clean()
				.values();
		},
		changeChart: function (chartName) {
			if (this.get('currentChartName') === null) {
				this.simulate(chartName);
			}
			this.set('currentChartName', chartName);
		},
		simulate: function (chartName) {
			chartName = chartName || this.get('currentChartName');
			var data = {};
			if(chartName === 'decomposition') {
				data.decomposition = 'decompositions-multiples.xml';
			}
			backendServiceM.simulate(data);
		}
	});

	var chartM = new ChartM();
	return chartM;
});
