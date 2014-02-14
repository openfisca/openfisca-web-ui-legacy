define([
	'underscore',
	'backbone.DeepModel',

	'backendServiceM'
	],
	function (_, Backbone, backendServiceM) {
		var DetailChartM = Backbone.DeepModel.extend({
			events: {},
			defaults: {
				source: {},
				datas: {},
				groupedDatas: {}
			},
			backendServiceM: backendServiceM,
			initialize: function () {
				console.info('DetailChartM initialized');
				this.listenTo(this.backendServiceM, 'change:apiData', this.parse);
			},
			parse: function () {
				this.set('source', this.backendServiceM.get('apiData'));
				this.clean();
				this.groupByPositive();
				this.groupByAll();
			},
			/*
				** Clean data **
				- Delete objects with null value
				- Create "value" property equal to values[0]
			*/
			clean: function () {
				var json = this.get('source').children.revdisp;
					json._id = 'revdisp';

				var doIt = function (json) {
					var that = this,
						old_children = json.children;
						json.children = [];

					_.each(old_children, function (el, name) {

						if(el.values[0] != 0) {
							var newEl = el;
							newEl._id = name;

							if(el.children) { doIt(el); }
							else {
								newEl.value = newEl.values[0];

								/* Add isPositive */
								if(newEl.value != 0) newEl.isPositive = (newEl.value > 0) ? true : false;
							}
							json.children.push(newEl);
						}
					});
					return json;
				};

				var result = doIt(json);
				this.set({datas: result});
				return result;
			},
			groupByPositive: function () {
				var groupedDatas = { positive: [], negative: [] };
				var doIt = function (obj) {
					_.each(obj, function (el, name) {
						if(el.hasOwnProperty('children')) {doIt(el.children);}
						else {
							if(el.values[0] > 0) groupedDatas.positive.push(el);
							else if(el.values[0] < 0) groupedDatas.negative.push(el);
						}
					});
				};
				doIt(this.get('datas').children);
				this.set({'groupedDatas.positive': groupedDatas});
				return groupedDatas;
			},
			groupByAll: function () {
				var groupedDatas = jQuery.extend(true, {}, this.get('datas'));
					groupedDatas.children = [];
					doIt = function (obj) {
					_.each(obj, function (el, name) {
						if(el.hasOwnProperty('children')) {doIt(el.children);}
						else groupedDatas.children.push(el);
					});
				};
				doIt(this.get('datas').children);
				this.set({'groupedDatas.all': groupedDatas});
				return groupedDatas;
			}
		});
		return DetailChartM;
	}
);
