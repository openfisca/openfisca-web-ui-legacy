define([
	'backendServiceM',
	'helpers',
	'parser',

	'jquery',
	'underscore',
	'backbone'
	],
	function (backendServiceM, helpers, Parser, $, _, Backbone) {

		var ChartM = Backbone.Model.extend({
			events: {},
			fetched: false,
			defaults: {
				source: {},

				waterfall_data: {},
				locating_data: {},
				distribution_data: {},

				vingtiles: {
					'_2011': [
						{ 'key': 'Revenu disponible', 'id': 'revdisp', 'values': [ {x: 0, y: 0}, {x: 5, y: 10476}, {x: 10, y: 13072}, {x: 15, y: 15125}, {x: 20, y: 16834}, {x: 25, y: 18558}, {x: 30, y: 20383}, {x: 35, y: 22370}, {x: 40, y: 24472}, {x: 45, y: 26718}, {x: 50, y: 29012}, {x: 55, y: 31457}, {x: 60, y: 34212}, {x: 65, y: 37194}, {x: 70, y: 40491}, {x: 75, y: 44101}, {x: 80, y: 48683}, {x: 85, y: 54259}, {x: 90, y: 62981}, {x: 95, y: 80540}] },
						{ 'key': 'Salaire imposable', 'id': 'sal', 'values': [ {x: 0, y: 0}, {x: 5, y: 888}, {x: 10, y: 2257}, {x: 15, y: 4177}, {x: 20, y: 6527}, {x: 25, y: 8799}, {x: 30, y: 11159}, {x: 35, y: 13260}, {x: 40, y: 14882}, {x: 45, y: 16210}, {x: 50, y: 17399}, {x: 55, y: 18595}, {x: 60, y: 19864}, {x: 65, y: 21265}, {x: 70, y: 22855}, {x: 75, y: 24724}, {x: 80, y: 27060}, {x: 85, y: 30244}, {x: 90, y: 35054}, {x: 95, y: 44895}] },
						{ 'key': 'Patrimoine', 'id': 'pat', 'values': [ {x: 0, y: 0}, {x: 5, y: 300}, {x: 10, y: 1600}, {x: 15, y: 3000}, {x: 20, y: 5500}, {x: 25, y: 9500}, {x: 30, y: 16800}, {x: 35, y: 29800}, {x: 40, y: 51700}, {x: 45, y: 83800}, {x: 50, y: 113500}, {x: 55, y: 144800}, {x: 60, y: 172200}, {x: 65, y: 204800}, {x: 70, y: 234900}, {x: 75, y: 275900}, {x: 80, y: 322300}, {x: 85, y: 399200}, {x: 90, y: 501600}, {x: 95, y: 755800}] }
					]
				}
			},
			backendServiceM: backendServiceM,
			initialize: function () {
				this.listenTo(this.backendServiceM, 'change:apiData', this.parse);
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
			get_distributionData: function (args) { var args = args || {};
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
			}
		});

		var chartM = new ChartM();
		return chartM;
	}
);
