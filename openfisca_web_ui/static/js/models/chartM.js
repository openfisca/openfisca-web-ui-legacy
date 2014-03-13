define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
	'helpers',
	'parser',

	'json!data/vingtiles.json'
	],
	function ($, _, Backbone, backendServiceM, helpers, Parser, vingtiles) {

		var ChartM = Backbone.Model.extend({
			events: {},
			fetched: false,
			defaults: {
				source: {},

				waterfall_data: {},
				locating_data: {},
				distribution_data: {},

				vingtiles: vingtiles,

				currentChartName: null,

				simulationInProgress: false
			},
			backendServiceM: backendServiceM,
			initialize: function () {
				this.listenTo(this.backendServiceM, 'change:apiData', this.parse);
				this.listenTo(this.backendServiceM, 'change:simulationInProgress', _.bind(function () {
					this.set('simulationInProgress', this.backendServiceM.get('simulationInProgress'));
				}, this));
			},
			parse: function () {
				this.fetched = true;
				this.set('source', $.extend(true, {}, this.backendServiceM.get('apiData')));
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
								.removeRootNode()
								.setParentNodes()
								.listChildren()
								.values();
			},
			get_distributionData: function (args) {
				args = args || {};
				if(args.type == 'default') {/* Cleaned up and ungrouped data */
					return new Parser(this.get('source'))
						.clean()
						.removeRootNode()
						.listChildren()
						.values();
				}
				else if(args.type == 'positive') {
					return new Parser(this.get('source'))
						.clean()
						.setPositiveSort()
						.listChildren()
						.values();
				}
				else if(args.type == 'test') {
					return new Parser(this.get('source'))
						.clean()
						.setTestSort()
						.listChildren()
						.values();
				}
				else {
					return new Parser(this.get('source'))
						.clean()
						.listChildren()
						.values();
				}
			},
			get_locatingData: function () { /* Just cleaned up */
				return new Parser(this.get('source'))
							.clean()
							.values();
			},
			simulate: function () {
				this.backendServiceM.simulate();
			}
		});

		var chartM = new ChartM();
		return chartM;
	}
);
