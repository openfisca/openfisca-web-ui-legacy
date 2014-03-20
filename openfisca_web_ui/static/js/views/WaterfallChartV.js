define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'chartM',
	'helpers',
	], function ($, _, Backbone, d3, chartM, helpers) {
		'use strict';

		d3.selection.prototype.moveToFront = function() { return this.each(function(){ this.parentNode.appendChild(this); }); };
		d3.selection.prototype.moveToBack = function() {return this.each(function() {var firstChild = this.parentNode.firstChild;if (firstChild) {this.parentNode.insertBefore(this, firstChild);}});};

		var WaterfallChartV = Backbone.View.extend({
			model: chartM,

			/* Settings */
			padding: {
				top: 50,
				right: 40,
				bottom: 90,
				left: 60,
			},
			margin: {
				top: 0,
				left: 0,
				bottom: 0,
				right: 80
			},
			maxWidth: 1000,
			innerPadding: 10,

			title: '',

			currentDataSet: {},
			bars: [],
			stopValues: {},

			positiveColor: '#6aa632',
			negativeColor: '#b22424',

			initialize: function () {
				this.updateDimensions();

				this.g = d3.select(this.el)
					.append('svg')
					.attr('height', this.height)
					.attr('width', this.width);

				this.listenTo(this.model, 'change:source', this.render);
			},
			render: function (args) {
				args = args || {};

				$('.nvtooltip').hide().remove();

				if(_.isUndefined(args.getDatas) || args.getDatas) {
					this.setData(this.model.get('waterfallData'));
				}

				this.buildBars(this.buildActiveBars);
				if(_.isUndefined(this.xAxis) && _.isUndefined(this.yAxis)) {
					this.buildLegend();
				} else {
					this.updateLegend();
				}
				return this;
			},
			setData: function (data) {
				// Internalize data from model and add waterfall key to each item, containing start and end values.
				/* Set stopvalues */
				var children = data,
					childrenLength = children.length,
					that = this;

				this.currentDataSet = data;

				var baseHeight = 0, _baseHeight = 0;
				_.each(this.currentDataSet, function (d) {
					_baseHeight += d.value;
					d.waterfall = {
						'startValue': baseHeight,
						'endValue': _baseHeight
					};
					baseHeight += d.value;
				});

				this.updateScales();
			},
			updateDimensions: function() {
				this.width = Math.min(this.$el.width(), this.maxWidth) - this.margin.left - this.margin.right;
				this.height = this.width * 0.8 - this.margin.bottom - this.margin.top;
			},
			updateScales: function () {
				var that = this;
				var currentDataSetValues = _.map(this.currentDataSet, function (data) {
					return [data.waterfall.startValue, data.waterfall.endValue];
				});
				var yMin, yMax;

				/* Set scales */
				yMin = d3.min(currentDataSetValues, function (d) { return d3.min(d);});
				yMax = d3.max(currentDataSetValues, function (d) { return d3.max(d);});
				this.scales = {
					x: d3.scale.ordinal()
						.rangeBands([this.padding.left, that.width-this.padding.right], 0, 0)
						.domain(that.currentDataSet.map(function(d) { return d.short_name; })),
					y: d3.scale.linear()
						.domain([yMin, yMax])
						.range([that.height - that.padding.bottom, that.padding.top])
				};

				var magnitude = (Math.abs(yMin) > Math.abs(yMax)) ? Math.abs(yMin): Math.abs(yMax);
				this.prefix = d3.formatPrefix(magnitude);
				this.prefix._scale = function (val) {
					if (that.prefix.symbol !== 'G' && that.prefix.symbol !== 'M' && that.prefix.symbol !== 'k' && that.prefix.symbol !== '') {
						return ("" + d3.round(val, 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
					}
					var roundLevel = (that.prefix.symbol == 'G' || that.prefix.symbol == 'M') ? 2: 0;
					if(that.prefix.symbol == 'k') val = that.prefix.scale(val)*1000;
					else val = that.prefix.scale(val);
					return (""+ d3.round(val, roundLevel)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
				};
				switch(this.prefix.symbol) {
					case 'G':
						this.legendText = 'Milliards €';
						this.prefix.symbolText = '\nmilliards €';
						break;
					case 'M':
						this.legendText = 'Millions €';
						this.prefix.symbolText = '\nmillions €';
						break;
					case 'k':
						this.legendText = 'En euros';
						this.prefix.symbolText = '€';
						break;
					case '':
						this.legendText = 'En euros';
						this.prefix.symbolText = '€';
						break;
					default:
						this.legendText = '';
				}
			},
			buildBars: function (endTransitionCallback) {
				// Create waterfall bars.
				var that = this;
				var dataLength = this.currentDataSet.length;
				var barsLength = (!_.isUndefined(this.bars[0])) ? this.bars[0].length: 0;
				var barWidth = (that.width - that.padding.left - that.padding.right - dataLength*that.innerPadding)/dataLength;

				this.bars = this.g.selectAll('.bar')
					.data(this.currentDataSet);

				this.bars
					.enter()
						.append('rect')
						.attr('id', function (d, i) { return 'bar-'+i; })
						.attr('class', 'bar')
						.attr('width', barWidth)
						.attr('height', 0)
						.attr("rx", 4)
						.attr("ry", 4)
						.attr('y', function (d, i) {
							return d.value < 0 ?
								that.scales.y(d.waterfall.startValue) :
								that.scales.y(d.waterfall.startValue) - (that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue));
						})
						.attr('x', function (d, i, a) {
							return 0;
						})
						.attr('fill', function (d) {
							if (d.value > 0) {
								return that.positiveColor;
							} else {
								return that.negativeColor;
							}
						})
						.attr('opacity', 0.8)
						.attr('stroke-width', 1);
				this.bars
					.transition()
						.duration(300)
						.attr('width', barWidth)
						.attr('height', function (d) {
							var _return;
							if (d.value < 0) {
								_return = that.scales.y(d.waterfall.endValue) - that.scales.y(d.waterfall.startValue);
							} else {
								_return= that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue);
							}
							return _return < 0.8 ? 0.8: _return;
						})
						.attr('x', function (d, i, a) {
								return that.scales.x(d.short_name) + that.innerPadding/2;
						})
						.attr('y', function (d, i) {
							return d.value < 0 ?
								that.scales.y(d.waterfall.startValue) :
								that.scales.y(d.waterfall.startValue) - (that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue));
						})
						.attr('fill', function (d) {
							if(d.value > 0) return that.positiveColor;
							else return that.negativeColor;
						})
						.each('start', function (d) {
							if(!_.isUndefined(that.activeBars)) {
								that.activeBars.on('mouseover', null);
								that.activeBars.on('mouseout', null);
								that.activeBars.remove();
							}
							if(!_.isUndefined(that.incomeLine)) that.incomeLine.transition().duration(100).remove();
							if(!_.isUndefined(that.incomeText)) that.incomeText.transition().duration(100).remove();
						})
						.each('end',function (d, i) {
							if(!_.isUndefined(endTransitionCallback) && i === 0) {
								endTransitionCallback.call(that);
							}
						});

				this.bars.exit()
					.transition()
						.duration(300)
						.attr('x', function (d, i, a) {
							return that.width*3;
						})
						.attr('opacity', 0)
						.each('end', function () {
							this.remove();
						});
			},
			buildActiveBars: function () {
				// Callback of buildBars.
				var that = this,
					dataLength = this.currentDataSet.length,
					barsLength = (!_.isUndefined(this.bars[0])) ? this.bars[0].length: 0,
					barWidth = (that.width - that.padding.left - that.padding.right)/dataLength;

				this.activeBars = this.g.selectAll('.active-bar')
					.data(this.currentDataSet);

				this.activeBars
					.enter()
						.append('rect')
						.attr('id', function (d, i) { return 'active-bar-'+i; })
						.attr('class', 'active-bar')
						.attr('width', barWidth)
						.attr('height', that.height)
						.attr('y', that.padding.top)
						.attr('x', function (d, i, a) {
							return that.scales.x(d.short_name);
						})
						.attr('fill', function (d) {
							if(d.value > 0) return that.positiveColor;
							else return that.negativeColor;
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
									.attr('opacity', 0);

							that.showTooltip(bar);

							that.bars
								.transition()
								.duration(100)
								.attr('opacity', function (_d, _i) {
									if(_i == i) return 1;
									else return 0.8;
								});

							if (!_.isUndefined(d.parentNodes[0])) {

								/*	Helper : getDeeperFirstChild */
								var getDeeperFirstChild = function (obj) {
									var doIt = function (el) {
										if(!_.isUndefined(el.children) && el.children.length > 0) {
											return doIt(el.children[0]);
										}
										return el;
									};
									return doIt(obj);
								};

								var parentNode = d.parentNodes[0];
									parentNode.name = $.isArray(parentNode.name) ? parentNode.name : parentNode.name.split(' ');

								var parentNodeFirstChildrenId = getDeeperFirstChild(
									_.findDeep(that.model.get('cleanData'), {_id: parentNode.id })
								)._id;
								var parentNodeFirstChildren = _.findWhere(that.currentDataSet, {_id: parentNodeFirstChildrenId});

								var yMiddleTextPos = 
									(barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0)) +
									(that.scales.y(parentNodeFirstChildren.waterfall.startValue) - (barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0)))/2;

								that.incomeLine = that.g.append('line')
									.attr('stroke', function () { return '#333'; })
									.attr('stroke-width', function () { return 2; })
									.attr('stroke-dasharray', ('3, 3'))
									.attr('opacity', 0)

									.attr('x1', function () { return barAttrs.x; })
									.attr('y1', function () { return barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0); })
									.attr('x2', function () { return that.width; })
									.attr('y2', function () { return barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0); })
									.moveToBack();

								that.incomeLine2 = that.g.append('line')
									.attr('stroke', function () { return '#333'; })
									.attr('stroke-width', function () { return 2; })
									.attr('stroke-dasharray', ('3, 3'))
									.attr('opacity', 0)

									.attr('x1', function () { return that.scales.x(parentNodeFirstChildren.short_name); })
									.attr('y1', function () { return that.scales.y(parentNodeFirstChildren.waterfall.startValue); })
									.attr('x2', function () { return that.width; })
									.attr('y2', function () { return that.scales.y(parentNodeFirstChildren.waterfall.startValue); })
									.moveToBack();

								that.incomeLine3 = that.g.append('line')
									.attr('stroke', function () { return '#333'; })
									.attr('stroke-width', function () { return 7; })
									.attr('opacity', 0)
									.attr('x1', function () { return that.width-10; })
									.attr('y1', function () { return (barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0)); })
									.attr('x2', function () { return that.width-10; })
									.attr('y2', function () { return that.scales.y(parentNodeFirstChildren.waterfall.startValue); });
								
								that.incomeText = that.g.selectAll('.income-number')
									.data((that.prefix._scale(d.parentNodes[0].value) + that.prefix.symbolText).split('\n'));

								that.incomeText
									.exit()
										.transition().duration(50)
										.attr('opacity', 0)
										.remove();

								that.incomeText
									.attr('y', function (_d, _i) {
										var lineHeight = parseInt(d3.select(this).attr('font-size'))+3;
										return yMiddleTextPos + lineHeight * _i - (that.incomeText.data().length * lineHeight-10);
									})
									.text(function (_d) {
										return _d;
									})
									.attr('opacity', 1)
									.enter()
										.append('text')
										.attr('class', 'income-number')
										.attr('font-size', 15)
										.attr('x', function () { return that.width + 5; })
										.attr('y', function (_d, _i) {
											var lineHeight = parseInt(d3.select(this).attr('font-size')) + 3;
											return yMiddleTextPos + lineHeight * _i - (that.incomeText.data().length * lineHeight-10);
										})
										.attr('font-weight', 'bold')
										.text(function (_d) {
											return _d;
										});

								that.incomeLabel = that.g.selectAll('.income-label')
									.data(parentNode.name);

								that.incomeLabel
									.text(function (d) { return d; })
									.attr('y', function (_d, _i) {
										var lineHeight = parseInt(d3.select(this).attr('font-size')) + 3;
										return yMiddleTextPos + lineHeight + _i * lineHeight;
									})
									.attr('x', function () { return that.width + 5; })
									.enter()
										.append('text')
										.attr('class', 'income-label')
										.attr('x', function () { return that.width + 5; })
										.attr('font-size', 12)
										.attr('font-weight', 'bold')
										.attr('y', function (_d, _i) {
											var lineHeight = parseInt(d3.select(this).attr('font-size'))+3;
											return yMiddleTextPos + lineHeight + _i * lineHeight;
										})
										.text(function (d) {
											return d;
										});

								that.incomeLabel
									.exit()
										.transition().duration(100)
										.remove();

								that.incomeLine
									.transition().duration(100)
									.attr('opacity', 1);

								that.incomeLine2
									.transition().duration(100)
									.attr('opacity', 1);

								that.incomeLine3
									.transition().duration(100)
									.attr('opacity', 1);
							}

							
						})
						.on('mouseout', function (d, i) {

							var bar = d3.select('#bar-'+i);

							d3.select(this)
								.transition()
								.duration(50)
									.attr('opacity', 0);
							
							that.bars
								.transition()
								.duration(100)
								.attr('opacity', function (_d, _i) {
									return 0.8;
								});

							that.hideTooltip(bar);
							
							if(!_.isUndefined(that.incomeLabel)) {
								that.incomeLabel
									.remove();
								that.incomeLine
									.remove();
								that.incomeLine2
									.remove();
								that.incomeLine3
									.remove();
								that.incomeText
									.remove();
							}
						});

				this.activeBars.moveToFront();

				this.activeBars
					.transition()
						.duration(300)
						.attr('width', barWidth)
						.attr('height', that.height)
						.attr('x', function (d, i) {
							return that.scales.x(d.short_name);
						})
						.attr('y', this.padding.top)
						.attr('fill', function (d) {
							if(d.value > 0) return that.positiveColor;
							else return that.negativeColor;
						})
						.attr('opacity', 0);

				this.activeBars
					.exit()
					.remove();
			},
			updateLegend: function () {
				var that = this;

				this.xAxis.scale(this.scales.x);
				this.yAxis.scale(this.scales.y);
				this.gridAxis.scale(this.scales.y);

				this.xAxisLegend
					.transition()
					.duration(300)
					.attr("transform", function () {
						var pos = that.height - that.padding.bottom;
						return 'translate(0,' + pos + ')';
					})
					.call(this.xAxis);

				this.yAxisLegend
					.transition()
					.duration(300)
					.call(this.yAxis);


				this.yGrid
					.transition()
					.duration(300)
					.call(this.gridAxis);

				this.g.selectAll('.x-axis .tick text')
					.attr('transform', function (d) {
						var el = d3.select(this),
							_dim = this.getBBox();

						var deltax = _dim.width/2,
							x = _dim.x+_dim.width,
							y = _dim.y;

						return 'translate(-'+deltax+', 0) rotate(-45,'+x+', '+y+')';
					});


				var legendTextSplited = this.legendText.split('\n');
				this.legendTextObject = this.g.selectAll('.legendText_y')
					.data(legendTextSplited);

				this.legendTextObject
					.text(function (d) { return d; })
					.enter().append('svg:text')
						.attr('class', 'legendText_y')
						.attr('fill', '#333')
						.attr('x', function (d) { return that.padding.left; })
						.attr('y', function (d, i) { return 10 + i*10; })
						.attr('font-size', 12)
						.attr('font-weight', 'normal')
						.attr('text-anchor', 'end')
						.text(function (d) { return d; });

				this.legendTextObject.moveToFront();

				this.legendTextObject.exit().remove();
			},
			buildLegend: function () {
				var that = this;
				this.xAxis = d3.svg.axis()
					.scale(this.scales.x)
					.orient('bottom');

				this.yAxis = d3.svg.axis()
					.scale(this.scales.y)
					.orient('left')
					.tickFormat(function (d) {
						return that.prefix._scale(d);
					});

				this.yAxisLegend = this.g.append("g");
				this.xAxisLegend = this.g.append("g");

				this.yAxisLegend
					.attr("class", "y-axis")
					.attr("transform", function () {
						var pos = that.width;
						return 'translate('+that.padding.left+',0)';
					})
					.call(this.yAxis);

				this.xAxisLegend
					.attr("class", "x-axis")
					.attr("transform", function () {
						var pos = that.height - that.padding.bottom;
						return 'translate(0,' + pos + ')';
					})
					.call(this.xAxis);

				this.gridAxis = d3.svg.axis()
					.scale(that.scales.y)
					.orient('left')
					.tickSize(-that.width+that.padding.left, 0, 0)
    				.tickFormat("");

				this.yGrid = this.g.append("g")
					.attr('class', 'grid')
					.attr('transform', function (d) {
						return 'translate('+that.padding.left+', 0)'; 
					})
					.call(this.gridAxis)
					.moveToBack();

				this.g.selectAll('.x-axis .tick text')
					.attr('transform', function (d) {
						var el = d3.select(this),
							_dim = this.getBBox();

						var deltax = _dim.width/2,
							x = _dim.x+_dim.width,
							y = _dim.y;

						return 'translate(-'+deltax+', 0) rotate(-45,'+x+', '+y+')';
				});

				var legendTextSplited = this.legendText.split('\n');
				this.legendTextObject = this.g.selectAll('.legendText_y')
					.data(legendTextSplited);

				this.legendTextObject
					.enter().append('svg:text')
						.attr('class', 'legendText_y')
						.attr('fill', '#333')
						.attr('x', function (d) { return that.padding.left; })
						.attr('y', function (d, i) { return 10 + i*10; })
						.attr('font-size', 12)
						.attr('font-weight', 'normal')
						.attr('text-anchor', 'end')
						.text(function (d) { return d; });

			},
			showTooltip: function (bar) {
				var d = bar.data()[0],
					that = this;
				/* Show tooltip */
				/* jshint multistr: true */
				this.$el.append('\
					<div class="nvtooltip xy-tooltip nv-pointer-events-none" id="nvtooltip-'+d._id+'" style="opacity: 0; position: absolute;">\
						<table class="nv-pointer-events-none">\
							<thead>\
								<tr class="nv-pointer-events-none">\
									<td colspan="3" class="nv-pointer-events-none">\
										<strong class="x-value">'+d.name+'</strong>\
									</td>\
								</tr>\
							</thead>\
							<tbody>\
								<tr class="nv-pointer-events-none">\
									<td>'+that.prefix._scale(d.value)+' '+this.prefix.symbolText+'</td>\
								</tr>\
							</tbody>\
						</table>\
					</div>\
				');
				var svg = this.$el.find('svg');
				var barBBox = {};
				bar.each(function () { barBBox = this.getBBox(); });

				d3.select(this.el).select('#nvtooltip-'+d._id)
					.style('left', function () {

						var tooltipWidth = $(this).width();

						var xPos = bar.attr('x') - (that.width * 2/3 < bar.attr('x') ? (tooltipWidth - barBBox.width): 0);
						return xPos + 'px';
					})
					.style('top', function () {
						var yPos = bar.attr('y');
						return yPos + 'px';
					})
					.transition().duration(100)
						.style('opacity', 1);

				/* Add bubble style */
				bar.attr('stroke-width', 3);
			},
			hideTooltip: function (bar) {
				var d = bar.data()[0];
				d3.select(this.el).select('#nvtooltip-'+d._id)
					.transition().duration(100)
						.style('opacity', 0)
						.remove();

				bar.attr('stroke-width', 1);
			}
		});
	return WaterfallChartV;
});
