define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM'
	],
	function ($, _, Backbone, backendServiceM) {
		var DetailChartM = Backbone.Model.extend({
			events: {},
			defaults: {
				source: {},
				datas: {},
				groupedDatasAll: {},
				groupedDatasPositive: {}
			},
			backendServiceM: backendServiceM,
			initialize: function () {
				this.listenTo(this.backendServiceM, 'change:apiData', this.parse);
			},
			parse: function () {
				this.set('source', $.extend(true, {}, this.backendServiceM.get('apiData')));
				this.clean();
				this.set('datas', this.parse_setParentsNodes(this.get('datas')));
				this.groupByPositive();
				this.groupByAll();
			},
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
				this.set({'groupedDatasPositive': groupedDatas});
				return groupedDatas;
			},
			groupByAll: function () {
				var groupedDatas = $.extend(true, {}, this.get('datas'));
					groupedDatas.children = [];
					doIt = function (obj) {
					_.each(obj, function (el, name) {
						if(el.hasOwnProperty('children')) {doIt(el.children);}
						else groupedDatas.children.push(el);
					});
				};
				doIt(this.get('datas').children);
				this.set({'groupedDatasAll': groupedDatas});
				return groupedDatas;
			},
			parse_setParentsNodes: function (data) {
				var that = this,
					_data = $.extend(true, {}, data);

				var doIt = function (loopData) {
					var	loopDataChildren = loopData.children,
						dataLength = Object._length(loopDataChildren);

					_.each(loopDataChildren, function (loopDatum, i) {

						if(!_.isUndefined(loopData.parentNodes) && i == dataLength-1) { loopDatum.parentNodes = loopData.parentNodes;}
						else { loopDatum.parentNodes = [];}

						if(i == dataLength-1) {
							loopDatum.parentNodes.push(loopData.description);
						}

						doIt(loopDatum);
					})
				}
				doIt(_data);
				return _data;
			}
		});
		return DetailChartM;
	}
);
