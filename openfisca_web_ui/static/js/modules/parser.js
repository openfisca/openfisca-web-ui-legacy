define([
	'jquery',
	'underscore',
	],
	function ($, _) {

		/* Parsing methods (private) */
		var Parser = function (data) {
			this.outputValue = $.extend(true, {}, data);
		};
		Parser.prototype = {
			clean: function () {
				var json = this.outputValue;
					json._id = 'root';

				var doIt = function (json) {
					var that = this,
						old_children = json.children;
						json.children = [];

					_.each(old_children, function (el) {
						if(el.values[0] !== 0) {
							var newEl = el;
							newEl._id = el.code;
							newEl.name = el.short_name;

							if(el.children) { doIt(el); }
							else {
								newEl.value = newEl.values[0];
							}
							json.children.push(newEl);
						}
					});
					return json;
				};

				var result = doIt(json);
				this.outputValue = result;
				return this;
			},
			/* Useless */
			groupByPositive: function () {
				var data = this.outputValue,
					groupedData = { positive: [], negative: [] };
				var doIt = function (obj) {
					_.each(obj, function (el, name) {
						if(el.hasOwnProperty('children')) {doIt(el.children);}
						else {
							if(el.values[0] > 0) groupedData.positive.push(el);
							else if(el.values[0] < 0) groupedData.negative.push(el);
						}
					});
				};
				doIt(data.children);
				this.outputValue = groupedData;
				return this;
			},
			/*
				List children

				Description : convert object type data in array type data of children
				Data requirements : cleaned
			*/
			listChildren: function () {
				var data = this.outputValue,
					groupedData = [];
					doIt = function (obj) {
						_.each(obj, function (el, name) {
							if(el.hasOwnProperty('children')) {doIt(el.children);}
							else groupedData.push(el);
						});
				};
				doIt(data.children);
				this.outputValue = groupedData;
				return this;
			},
			/*
				Remove Root Node

				Description : Delete first "root" node
				Data requirements : cleaned
			*/
			removeRootNode: function () {
				var data = this.outputValue,
					json = _.where(data.children, function (d) {
						return d._id == 'revdisp';
					});
				this.outputValue = json[0];
				return this;
			},

			/*
				Set Parentnodes
				
				Description : set "parentNodes" property in each node
				Data requirements : cleaned
			*/
			setParentNodes: function () {
				var that = this,
					_data = this.outputValue;

				var doIt = function (loopData) {
					var	loopDataChildren = loopData.children,
						dataLength = Object._length(loopDataChildren);

					_.each(loopDataChildren, function (loopDatum, i) {
						if(!_.isUndefined(loopData.parentNodes) && i == dataLength-1) { loopDatum.parentNodes = loopData.parentNodes;}
						else { loopDatum.parentNodes = [];}

						if(i == dataLength-1) loopDatum.parentNodes.push(loopData.name);
						doIt(loopDatum);
					});
				};
				doIt(_data);
				this.outputValue = _data;
				return this;
			},
			/*
				Set Positive

				Description : set "positive" sort property in each children
				Data requirements : cleaned
			*/
			setPositiveSort: function () {
				var data = this.outputValue;
				var doIt = function (obj) {
					_.each(obj, function (el, name) {
						el.sortKey = 'positive';
						el.sort = {};
						if(el.hasOwnProperty('children')) { doIt(el.children); }
						else {
							if(el.values[0] > 0) el.sort = true;
							else if(el.values[0] < 0) el.sort = false;
						}
					});
				};
				doIt(data.children);
				this.outputValue = data;
				return this;
			},
			setTestSort: function () {
				var data = this.outputValue;
				var doIt = function (obj) {
					_.each(obj, function (el, i) {
						el.sortKey = 'test';
						el.sort = {};
						if(el.hasOwnProperty('children')) { doIt(el.children); }
						else {
							if(i === 0) el.sort = 'bbb';
							else if(i === 1) el.sort = 'aaa';
							else if(i === 2) el.sort = 'ccc';
							else if(i === 3) el.sort = 'ddd';
							else if(i === 4) el.sort = 'eee';
							else if(i === 5) el.sort = 'fff';
							else if(i === 6) el.sort = 'ggg';
							else if(i === 7) el.sort = 'hhh';
							else if(i === 8) el.sort = 'iii';
							else if(i === 9) el.sort = 'jjj';
						}
					});
				};
				doIt(data.children);
				this.outputValue = data;
				return this;
			},
			/*
				Values

				Description : return parsed data this.outputValue
			*/
			values: function () {
				console.log(this.outputValue);
				if(_.isObject(this.outputValue) && !_.isArray(this.outputValue)) return $.extend(true, {}, this.outputValue);
				else return this.outputValue;
			}
		};

		return Parser;
	}
);
