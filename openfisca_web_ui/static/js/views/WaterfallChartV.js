define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'DetailChartM',
	'helpers',
	], function ($, _, Backbone, d3, DetailChartM, helpers) {
		'use strict';

		var WaterfallChartV = Backbone.View.extend({
			// events: {
			// 	'click': 'focusOnBar'
			// },

			/* Properties */
			model: new DetailChartM(),
			views: [],

			/* Settings */
			padding: {
				top: 20,
				right: 0,
				bottom: 30,
				left: 50,
			},
			innerPadding: 20,

			title: '',

			currentDataSet: {},
			bars: [],
			stopValues: {},

			/* Settings */

			initialize: function (parent) {
				if(_.isUndefined(parent)) console.error('Missing parent object in WaterfallChartV constructor');

				console.log('WaterfallChartV initialized');

				this.g = parent.svg.append('g').attr('id', 'waterfall-chart');
				this.setElement(this.g[0]);

				this.height = parent.height;
				this.width = parent.width;

				this.listenTo(this.model, 'change:groupedDatasAll', this.render);
				if(!_.isEmpty(this.model.get('groupedDatasAll'))) this.render();
			},
			render: function () {

				this.setData(this.model.get('groupedDatasAll'));

				this.updateScales();

				if(_.isUndefined(this.xAxis) && _.isUndefined(this.yAxis)) this.buildLegend();
				else this.updateLegend();

				this.buildBars();
				return this;
			},

			focusOnBar: function (e) {
				console.log(e, this);
			},

			setData: function (data) {
				/* Set stopvalues */
				var children = data.children,
					childrenLength = children.length,
					that = this;

				this.currentDataSet = $.extend(true, {}, data);

				var baseHeight = 0, _baseHeight = 0;
				_.each(this.currentDataSet.children, function (d) {
					_baseHeight += d.value;
					d.waterfall = {
						'startValue': baseHeight,
						'endValue': _baseHeight
					};
					baseHeight += d.value;
				});
			},
			updateScales: function () {
				var that = this,
					currentDataSetValues = _.map(this.currentDataSet.children, function (data) {
						return [data.waterfall.startValue, data.waterfall.endValue];
				});

				/* Set scales */
				this.scales = {
					x: d3.scale.ordinal()
						.rangeBands([this.padding.left, that.width-this.padding.right], 0, 0)
						.domain(that.currentDataSet.children.map(function(d) {
							return d.name;
					})),
					y: d3.scale.linear()
							.domain([
								d3.min(currentDataSetValues, function (d) { return d3.min(d);}),
								d3.max(currentDataSetValues, function (d) { return d3.max(d);})
					]).range([that.height - that.padding.bottom, that.padding.top])
				};
			},
			buildBars: function () {
				var that = this,
					dataLength = this.currentDataSet.children.length,
					barsLength = (!_.isUndefined(this.bars[0])) ? this.bars[0].length: 0,
					barWidth = (that.width - that.padding.left - that.padding.right - dataLength*that.innerPadding)/dataLength;
				
				this.bars = this.g.selectAll('.bar')
						.data(this.currentDataSet.children)

					this.bars
						.enter()
							.append('rect')
							.attr('class', 'bar')
							.attr('width', barWidth)
							.attr('height', 0)
							.attr('y', function (d, i) {
								if(d.value < 0) var r = that.scales.y(d.waterfall.startValue);
								else var r = that.scales.y(d.waterfall.startValue) - (that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue));
								return r;
							})
							.attr('x', function (d, i, a) {
								return that.width;
							})
							.attr('fill', function (d) {
									if(d.value > 0) return '#5cb85c';
									else return '#C11137';
							});
					this.bars
						.transition()
							.duration(1000)
							.attr('width', barWidth)
							.attr('height', function (d) {
								if(d.value < 0) return that.scales.y(d.waterfall.endValue) - that.scales.y(d.waterfall.startValue);
								else return that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue);
							})
							.attr('x', function (d, i, a) {
									return that.scales.x(d.name) + that.innerPadding/2;
							})
							.attr('y', function (d, i) {
								if(d.value < 0) var r = that.scales.y(d.waterfall.startValue);
								else var r = that.scales.y(d.waterfall.startValue) - (that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue));
								return r;
							})
							.attr('fill', function (d) {
									if(d.value > 0) return '#5cb85c';
									else return '#C11137';
							});

					this.bars.exit()
						.transition()
							.duration(1000)
							.attr('x', function (d, i, a) {
								return that.width*3;
							})
							.attr('opacity', 0)
							.each('end', function () {
								this.remove();
							});
			},
			buildBackBars: function () {

			},
			updateLegend: function () {

				this.xAxis.scale(this.scales.x)
				this.yAxis.scale(this.scales.y)

				this.yAxisLegend
					.transition()
					.duration(1000)
					.call(this.yAxis);

				this.xAxisLegend
					.transition()
					.duration(1000)
					.call(this.xAxis);
			},
			buildLegend: function () {

				var that = this;
					this.xAxis = d3.svg.axis()
						.scale(this.scales.x)
						.orient("bottom")

					this.yAxis = d3.svg.axis()
						.scale(this.scales.y)
						.tickSize(this.width - this.padding.left)
						.orient("left")
						.tickFormat(d3.format(">"));

					this.yAxisLegend = this.g.append("g");
					this.xAxisLegend = this.g.append("g");

					this.yAxisLegend
						.attr("class", "y-axis")
						.attr("transform", function () {
							var pos = that.width;
							return 'translate('+pos+',0)';
						})
						.call(this.yAxis)

					this.xAxisLegend
						.attr("class", "x-axis")
						.attr("transform", function () {
							var pos = that.height - that.padding.bottom;
							return 'translate(0,' + pos + ')';
						})
						.call(this.xAxis)
			}
		});
	return WaterfallChartV;
});
