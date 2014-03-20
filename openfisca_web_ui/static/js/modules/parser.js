define([
	'jquery',
	'underscore',
	'helpers'
	],
	function ($, _, helpers) {

		/* Parsing methods (private) */
		var Parser = function (data) {
			this.outputValue = $.extend(true, {}, data);
		};
		Parser.prototype = {
			clean: function () {
				var json = this.outputValue;
					json._id = 'root';

				var doIt = function (json) {
					json.value = json.values[0];
					var that = this,
						old_children = json.children;
						json.children = [];

					_.each(old_children, function (el) {
						if(el.values[0] !== 0) {
							var newEl = el;
							newEl._id = el.code;

							if(el.children) { doIt(el); }
							
							newEl.value = newEl.values[0];
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
							if(el.hasOwnProperty('children')) { doIt(el.children); }
							else { groupedData.push(el); }
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

						if(i == dataLength-1) {
							loopDatum.parentNodes.push({
									id: loopData._id,
									name: loopData.name,
									value: loopData.value
							});
						}
						doIt(loopDatum);
					});
				};
				doIt(_data);
				this.outputValue = _data;
				return this;
			},
			/*
				Set Sorts
				
				Description : set "sorts" property in child node according to the API return
				Data requirements : cleaned
			*/
			setDecompositionSort: function () {
				if(this.outputValue.code != 'root') return this;

				/* On sélectionne l'ensemble des noeuds, la donnée non décomposée */
				var sourceData = _.findWhere(this.outputValue.children, {code: 'revdisp'}),
					sortData = _.filter(this.outputValue.children, function (node) {
						return node.code != 'revdisp';
					}),
					defineChildrenSortProperty = function (_sortNode, sortId) {
						var sortValue = _sortNode.code;
							doIt = function (_node) {
							_.each(_node.children, function(_n) {
								if(_n.hasOwnProperty('children')) {
									doIt(_n);
								}
								else {
									var sourceNode = _.findDeep(sourceData, {code: _n.code});
									if(!_.isUndefined(sourceNode)) {
										if(_.isUndefined(sourceNode.sorts)) sourceNode.sorts = {};
										sourceNode.sorts[sortId] = sortValue;
									}
								}
							});
						};
						doIt(_sortNode);
				};
				_.each(sortData, function (sortNode) {
					var sortId = sortNode.code;
					_.each(sortNode.children, function (sortCNode) {
						defineChildrenSortProperty(sortCNode, sortId);
					});
				});
				this.outputValue = sourceData;
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
						if(!el.hasOwnProperty('sorts')) el.sorts = {};
						if(el.hasOwnProperty('children')) { doIt(el.children); }
						else {
							if(el.values[0] > 0) el.sorts.positive = true;
							else if(el.values[0] < 0) el.sorts.positive = false;
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
				if(_.isObject(this.outputValue) && !_.isArray(this.outputValue)) return $.extend(true, {}, this.outputValue);
				else return this.outputValue;
			}
		};

		return Parser;
	}
);
