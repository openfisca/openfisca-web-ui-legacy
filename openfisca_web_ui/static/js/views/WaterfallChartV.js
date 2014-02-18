define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'DetailChartM',
	'helpers',
	], function ($, _, Backbone, d3, DetailChartM, helpers) {
		'use strict';

		d3.selection.prototype.moveToFront = function() { return this.each(function(){ this.parentNode.appendChild(this); }); };
		d3.selection.prototype.moveToBack = function() {return this.each(function() {var firstChild = this.parentNode.firstChild;if (firstChild) {this.parentNode.insertBefore(this, firstChild);}});};

		var WaterfallChartV = Backbone.View.extend({
			// events: {
			// 	'click': 'focusOnBar'
			// },

			/* Properties */
			model: new DetailChartM(),
			views: [],

			/* Settings */
			padding: {
				top: 50,
				right: 0,
				bottom: 30,
				left: 50,
			},
			margin: {
				top: 0,
				left: 0,
				bottom: 0,
				right: 50
			},
			innerPadding: 20,

			title: '',

			currentDataSet: {},
			bars: [],
			stopValues: {},

			/* Settings */

			initialize: function (parent) {
//				if(_.isUndefined(parent)) console.error('Missing parent object in WaterfallChartV constructor');

				this.g = parent.svg.append('g').attr('id', 'waterfall-chart');
				this.setElement(this.g[0]);

				this.height = parent.height - this.margin.bottom - this.margin.top;
				this.width = parent.width - this.margin.left - this.margin.right;

				this.listenTo(this.model, 'change:groupedDatasAll', this.render);
				if(!_.isEmpty(this.model.get('groupedDatasAll'))) this.render();
			},
			render: function () {

				this.setData(this.model.get('groupedDatasAll'));

				this.updateScales();

				if(_.isUndefined(this.xAxis) && _.isUndefined(this.yAxis)) this.buildLegend();
				else this.updateLegend();

				this.buildBars({endTransitionCallback: this.buildActiveBars});

				return this;
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

				var magnitude = d3.min(currentDataSetValues, function (d) { return d3.min(d);});

				this.prefix = d3.formatPrefix(magnitude);
				switch(this.prefix.symbol) {
					case 'G':
						this.legendText = 'En\nmilliards\nd\'euros';
						break;
					case 'M':
						this.legendText = 'En\nmillions\nd\'euros';
						break;
					default:
						this.legendText = 'En euros';
				}
			},
			buildBars: function (args) {
				var that = this,
					dataLength = this.currentDataSet.children.length,
					barsLength = (!_.isUndefined(this.bars[0])) ? this.bars[0].length: 0,
					barWidth = (that.width - that.padding.left - that.padding.right - dataLength*that.innerPadding)/dataLength,
					args = args || {};
				
				this.bars = this.g.selectAll('.bar')
						.data(this.currentDataSet.children)

				this.bars
					.enter()
						.append('rect')
						.attr('id', function (d, i) { return 'bar-'+i; })
						.attr('class', 'bar')
						.attr('width', barWidth)
						.attr('height', 0)
						.attr('y', function (d, i) {
							if(d.value < 0) var r = that.scales.y(d.waterfall.startValue);
							else var r = that.scales.y(d.waterfall.startValue) - (that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue));
							return r;
						})
						.attr('x', function (d, i, a) {
							return 0;
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
							if(d.value < 0) var _return = that.scales.y(d.waterfall.endValue) - that.scales.y(d.waterfall.startValue);
							else var _return = that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue);

							return _return < 0.8 ? 0.8: _return;
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
						})
						.each('end',function (d, i) {
							if(!_.isUndefined(args.endTransitionCallback) && i==0) {
								args.endTransitionCallback.call(that);
							}
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
			buildActiveBars: function () {
				var that = this,
					dataLength = this.currentDataSet.children.length,
					barsLength = (!_.isUndefined(this.bars[0])) ? this.bars[0].length: 0,
					barWidth = (that.width - that.padding.left - that.padding.right)/dataLength;

				this.activeBars = this.g.selectAll('.active-bar')
					.data(this.currentDataSet.children);

				this.activeBars
					.enter()
						.append('rect')
						.attr('id', function (d, i) { return 'active-bar-'+i; })
						.attr('class', 'active-bar')
						.attr('width', barWidth)
						.attr('height', that.height)
						.attr('y', that.padding.top)
						.attr('x', function (d, i, a) {
							return that.scales.x(d.name);
						})
						.attr('fill', function (d) {
							if(d.value > 0) return '#5cb85c';
							else return '#C11137';
						})
						.attr('opacity', 0)
						.on('mouseover', function (d, i) {

							var bar = d3.select('#bar-'+i),
								barAttrs = {
									x: parseInt(bar.attr('x')),
									y: parseInt(bar.attr('y')),
									width: parseInt(bar.attr('width')),
									height: parseInt(bar.attr('height')),
									fill: bar.attr('fill')
								},
								barData = bar.data()[0];

							d3.select(this)
								.transition()
								.duration(50)
									.attr('opacity', 0)

							that.evolutionLabel = that.g.append('text')
								.attr('x', that.scales.x(d.name) + barWidth/2)
								.attr('y', function () {
										var margin = 5;
										return (barAttrs.y - margin);
								})
								.attr('font-weight', 'bold')
								.attr('font-size', 19)
								.attr('text-anchor', 'middle')
								.attr('fill', d3.select(this).attr('fill'))
								.text(function () {
									var v = d3.round(d.value);
									return ((d.value > 0)? '+': '') + v;
								})
								.attr('opacity', 0)
							that.evolutionLabel
								.transition().duration(100)
								.attr('opacity', 1)

							that.bars
								.transition()
								.duration(100)
								.attr('opacity', function (_d, _i) {
									if(_i != i) return 0.4;
								});


							that.incomeLine = that.g.append('line')

								.attr('stroke', function () { return barAttrs.fill; })
								.attr('stroke-width', function () {
									return 2;
								})
								.attr('opacity', 0)

								.attr('x1', function () { return barAttrs.x })
								.attr('y1', function () {  return barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0);})
								.attr('x2', function () {  return that.width - that.padding.right })
								.attr('y2', function () { return barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0);})
								.moveToFront();
							
							that.incomeText = that.g.append('text')
								.attr('fill', '#333')
								.attr('x', function () { return that.width + 5 })
								.attr('y', function () {  return barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0); })
								.attr('font-size', 16)
								.attr('font-weight', 'bold')
								.text(function () { 
									var v = d3.round(barData.waterfall.endValue);
									return v
								});

							that.incomeLine
								.transition().duration(100)
								.attr('opacity', 1);
						})
						.on('mouseout', function (d, i) {
							d3.select(this)
								.transition()
								.duration(50)
									.attr('opacity', 0);
							
							that.bars
								.transition()
								.duration(100)
								.attr('opacity', function (_d, _i) {
									return 1;
								});

							that.evolutionLabel
								.transition()
								.duration(100)
									.attr('opacity', 0)
									.remove()

							that.incomeLine
								.transition().duration(100)
								.attr('opacity', 0)
								.remove();

							that.incomeText
								.transition().duration(100)
								.attr('opacity', 0)
								.remove();
						});

				this.activeBars.moveToFront();

				this.activeBars
					.transition()
						.duration(1000)
						.attr('width', barWidth)
						.attr('height', that.height)
						.attr('x', function (d, i) {
							return that.scales.x(d.name);
						})
						.attr('y', this.padding.top)
						.attr('fill', function (d) {
							if(d.value > 0) return '#5cb85c';
							else return '#C11137';
						})
						.attr('opacity', 0);

				this.activeBars
					.exit()
					.remove();
			},
			updateLegend: function () {
				var that = this;

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


				var legendTextSplited = this.legendText.split('\n');
				this.legendTextObject = this.g.selectAll('.legendText_y')
					.data(legendTextSplited)

				this.legendTextObject
					.enter().append('svg:text')
					.attr('class', 'legendText_y')
					.attr('fill', '#333')
					.attr('x', function (d) { return that.padding.left; })
					.attr('y', function (d, i) {  return 10 + i*10; })
					.attr('font-size', 12)
					.attr('font-weight', 'normal')
					.attr('text-anchor', 'end')
					.text(function (d) { return d; });

				this.legendTextObject
					.exit().transition().duration(50).remove();
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
						.tickFormat(function (d) {
					        return that.prefix.scale(d); 
					    })

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
						.call(this.xAxis);

				var legendTextSplited = this.legendText.split('\n');
				this.legendTextObject = this.g.selectAll('.legendText_y')
					.data(legendTextSplited);

				this.legendTextObject
					.enter().append('svg:text')
						.attr('class', 'legendText_y')
						.attr('fill', '#333')
						.attr('x', function (d) { return that.padding.left; })
						.attr('y', function (d, i) {  return 10 + i*10; })
						.attr('font-size', 12)
						.attr('font-weight', 'normal')
						.attr('text-anchor', 'end')
						.text(function (d) { return d; });

			}
		});
	return WaterfallChartV;
});
