define([
	'd3',
	'helpers',

	'jquery',
	'underscore',
	'backbone'
	],
	function (d3, helpers) {

		var AggregateChartV = Backbone.View.extend({
			events: {},


			/* Settings */
			maxCenterNumbersByLine: 3,
			width: 980,
			height: 490,
			padding: { top: 20, right: 20, bottom: 20, left: 20 },
			outPosition: {x: -20, y: -20},
			
			/* Properties */
			title: '',
			data: {},
			elements: {},
			layouts: [],
			parent: undefined,
			scales: {},
			divisions: {
				width: 1,
				height: 1
			},

			valuesGroups: {},

			initialize: function (args) { var args = args || {};

			/* Have to use ? : : with several options to switch between vals) */

				// this.width = (_.isNumber(args.width)) ? args.width: this.width;
				// this.height = (_.isNumber(args.height)) ? args.height: this.height;
				// this.padding = (_.isObject(args.padding)) ? args.padding: this.padding;
				this.title = (_.isString(args.title)) ? args.title: this.title;

				if(!_.isUndefined(args.parent)) this.parent = args.parent;
				else console.error('Missing parent element arg in AggregateChartV constructor');

				if(!_.isUndefined(args.sortKey)) this.sortKey = args.sortKey;
				else console.error('Missing sortKey (data key) arg in AggregateChartV constructor');

				if(!_.isUndefined(args.bubbles)) this.bubbles = args.bubbles;
				else console.error('Missing sortKey (data key) arg in AggregateChartV constructor');

				this.width = this.parent.width;
				this.height = this.parent.height;
				this.model = this.parent.model;

				/* Get specific datas */
				this.datas = this.model.get(this.sortKey);

				/* define columns and ranks number */
				this.defineDivisions();

				this.createLayouts();

				this.render();
			},
			defineDivisions: function () {
				var dataLength = Object._length(this.datas);

				this.divisions = {
					'height': (Math.floor(dataLength / 3) + 1),
					'width': (dataLength > 2) ? 3 : dataLength
				};
			},
			createLayouts: function () {
				var that = this,
					dataGroupIndex = 0;

				_.each(this.datas, function (data) {

					data.map(function (d, i) {
						d.deltaPosition = {
							x: (Math.floor(dataGroupIndex%that.divisions.width)) * (that.width / that.divisions.width),
							y: (Math.floor(dataGroupIndex/that.divisions.width)) * (that.height / that.divisions.height)
						};
						console.log(d);
					});

					dataGroupIndex++;
				});


				console.log(this.datas);

				// console.log(d3.layout.pack()
				// 			.nodes(data));
		
					console.log(this.datas.positive);
					var layout = d3.layout.pack()
							.nodes(this.datas)
							.size([that.width, that.height])
					

			},
			render: function () {

				this.bubbles
					.attr('x', function (d) {
						return d.delta.x + d.x;
					})
					.attr('y', function (d) {
						return d.delta.y + d.y;
					});
					

				return this;
			}
		});
		return AggregateChartV;
	}
);




/* 
// generateValuesGroup: function () {
			// 	var datas = this.model.get(this.parent.datakey),
			// 		that = this,
			// 		index = 0;
			// 	_.each(datas, function (el) {
			// 		if(typeof el[that.sortKey] == 'undefined') return;

			// 		if(!_.has(that.valuesGroups, el[that.sortKey])) {
			// 			that.valuesGroups[el[that.sortKey]] = {
			// 				count: 0,
			// 				index: index
			// 			}
			// 			index++;
			// 		}
			// 		else {
			// 			that.valuesGroups[el[that.sortKey]].count += 1;
			// 		}
			// 	});
			// },
			createLayouts: function () {
				// this.datas = this.model.get(this.parent.datakey),
				// 	dataGroupsLength = this.valuesGroups.length,
				// 	that = this;

				this.scales.x = d3.scale.ordinal()
					.domain(d3.range(Object._length(this.valuesGroups)))
					.rangePoints([0, this.width], 1);

				// this.scales.y = d3.scale.ordinal()
				// 	.domain(d3.range(Object._length(this.valuesGroups)))
				// 	.rangePoints([0, this.height], 1);


				this.datas.map(function (d, i) {
					d.cx = (typeof d[that.sortKey] == 'undefined') ? that.outPosition.x : that.scales.x(that.valuesGroups[d.isPositive.toString()].index);
					d.cy = that.height/2;

					if(d.isPositive == true) d.fill = '#AA7858';
					else d.fill = '#AAAAAA';
				});

				this.parent.d_bubbles
					.attr('cx', function (d, i) {
						if(typeof d[that.sortKey] == 'undefined') return that.outPosition.x;
						else return ;
					})
					.attr('cy', function (d, i) {
						return that.height/2;
					})
			},*/
