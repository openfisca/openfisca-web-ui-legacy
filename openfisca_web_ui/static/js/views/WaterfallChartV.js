define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'chartM',
], function ($, _, Backbone, d3, chartM) {
	'use strict';

	var WaterfallChartV = Backbone.View.extend({
		barLeftAndRightPadding: 10,
		bars: [],
		colors: {
			negative: '#b22424',
			positive: '#6aa632',
		},
		duration: 100, // in ms
		margin: {
			top: 0,
			left: 0,
			bottom: 0,
			right: 80
		},
		maxBarWidth: 100, // in pixels
		minBarHeight: 1, // in pixels
		model: chartM,
		padding: {
			top: 50,
			right: 40,
			bottom: 90,
			left: 60,
		},
		stopValues: {},
		svg: null,
		initialize: function () {
			_.bindAll(this, 'dataToColor');
			this.updateDimensions();
			this.svg = d3.select(this.el)
				.append('svg')
				.attr('height', this.height)
				.attr('width', this.width);
			this.listenTo(this.model, 'change:source', this.render);
			// TODO Bind this global event to caller object.
			$(window).on('resize', _.bind(this.windowResize, this));
		},
		buildActiveBars: function () {
			var that = this;
			var waterfallData = this.model.get('waterfallData');
			var barWidth = (that.width - that.padding.left - that.padding.right) / waterfallData.length;
			this.activeBars = this.svg.selectAll('.active-bar').data(waterfallData);
			this.activeBars
				.enter()
					.append('rect')
					.attr('id', function (d, i) { return 'active-bar-'+i; })
					.attr('class', 'active-bar')
					.attr('width', barWidth)
					.attr('height', that.height)
					.attr('y', that.padding.top)
					.attr('x', function (d) { return that.scales.x(d.short_name); }) // jshint ignore:line
					.attr('fill', that.dataToColor)
					.attr('opacity', 0)
					.on('mouseover', function (d, i) {
						var bar = d3.select('#bar-' + i);
						var barAttrs = {
							x: parseInt(bar.attr('x')),
							y: parseInt(bar.attr('y')),
							width: parseInt(bar.attr('width')),
							height: parseInt(bar.attr('height')),
							fill: bar.attr('fill')
						};
						var barData = bar.data()[0];

						d3.select(this)
							.transition()
							.duration(50)
								.attr('opacity', 0);

						that.showTooltip(bar);

						that.bars
							.transition()
							.duration(100)
							.attr('opacity', function (_d, _i) { return _i == i ? 1 : 0.8; });

						if (!_.isUndefined(d.parentNodes[0])) {

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
							var parentNodeFirstChildren = _.findWhere(waterfallData, {_id: parentNodeFirstChildrenId});

							var yMiddleTextPos = (barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0)) +
								(that.scales.y(parentNodeFirstChildren.waterfall.startValue) - (barAttrs.y +
								(barData.value < 0 ? (barAttrs.height) : 0)))/2;

							that.incomeLine = that.svg.append('line')
								.attr('stroke', function () { return '#333'; })
								.attr('stroke-width', function () { return 2; })
								.attr('stroke-dasharray', ('3, 3'))
								.attr('opacity', 0)
								.attr('x1', function () { return barAttrs.x; })
								.attr('y1', function () {
									return barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0);
								})
								.attr('x2', function () { return that.width; })
								.attr('y2', function () {
									return barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0);
								})
								.moveToBack();

							that.incomeLine2 = that.svg.append('line')
								.attr('stroke', function () { return '#333'; })
								.attr('stroke-width', function () { return 2; })
								.attr('stroke-dasharray', ('3, 3'))
								.attr('opacity', 0)

								.attr('x1', function () {
									return that.scales.x(parentNodeFirstChildren.short_name); // jshint ignore:line
								})
								.attr('y1', function () {
									return that.scales.y(parentNodeFirstChildren.waterfall.startValue);
								})
								.attr('x2', function () { return that.width; })
								.attr('y2', function () {
									return that.scales.y(parentNodeFirstChildren.waterfall.startValue);
								})
								.moveToBack();

							that.incomeLine3 = that.svg.append('line')
								.attr('stroke', function () { return '#333'; })
								.attr('stroke-width', function () { return 7; })
								.attr('opacity', 0)
								.attr('x1', function () { return that.width-10; })
								.attr('y1', function () {
									return (barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0));
								})
								.attr('x2', function () { return that.width-10; })
								.attr('y2', function () {
									return that.scales.y(parentNodeFirstChildren.waterfall.startValue);
								});
							
							that.incomeText = that.svg.selectAll('.income-number')
								.data([that.prefix._scale(d.parentNodes[0].value) + ' ' + that.legendCurrencySymbol()]);

							that.incomeText
								.exit()
									.transition().duration(50)
									.attr('opacity', 0)
									.remove();

							that.incomeText
								.attr('y', function (_d, _i) {
									var lineHeight = parseInt(d3.select(this).attr('font-size'))+3;
									return yMiddleTextPos + lineHeight * _i -
										(that.incomeText.data().length * lineHeight-10);
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
										return yMiddleTextPos + lineHeight * _i -
											(that.incomeText.data().length * lineHeight-10);
									})
									.attr('font-weight', 'bold')
									.text(function (_d) {
										return _d;
									});

							that.incomeLabel = that.svg.selectAll('.income-label').data(parentNode.name);

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
									.text(function (d) { return d; });

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
							.attr('opacity', 0.8);
						bar.attr('stroke-width', 1);

						d3.select(that.el).select('.nvtooltip')
							.transition()
							.duration(100)
							.style('opacity', 0)
							.remove();

						if(!_.isUndefined(that.incomeLabel)) {
							that.incomeLabel.remove();
							that.incomeLine.remove();
							that.incomeLine2.remove();
							that.incomeLine3.remove();
							that.incomeText.remove();
						}
					});

			this.activeBars.moveToFront();

			this.activeBars
				.transition()
					.duration(this.duration)
					.attr('width', barWidth)
					.attr('height', that.height)
					.attr('x', function (d) {
						return that.scales.x(d.short_name); // jshint ignore:line
					})
					.attr('y', this.padding.top)
					.attr('fill', that.dataToColor)
					.attr('opacity', 0);

			this.activeBars
				.exit()
				.remove();
		},
		buildBars: function (endTransitionCallback) {
			var that = this;
			var waterfallData = this.model.get('waterfallData');
			var barWidth = (this.width - this.padding.left - this.padding.right -
				this.barLeftAndRightPadding * waterfallData.length) / waterfallData.length;
			this.bars = this.svg.selectAll('.bar').data(waterfallData);
			this.bars
				.enter()
					.append('rect')
					.attr('id', function (d, i) { return 'bar-' + i; })
					.attr('class', 'bar')
					.attr('rx', 4)
					.attr('ry', 4)
					.attr('fill', that.dataToColor)
					.attr('opacity', 0.8)
					.attr('stroke-width', 1);
			this.bars
				.transition()
					.duration(this.duration)
					.attr('width', Math.min(barWidth, this.maxBarWidth))
					.attr('height', function (d) {
						var height = d.value < 0 ?
							that.scales.y(d.waterfall.endValue) - that.scales.y(d.waterfall.startValue) :
							that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue);
						return Math.max(height, that.minBarHeight);
					})
					.attr('x', function (d) {
						return that.scales.x(d.short_name) + barWidth / 4; // jshint ignore:line
					})
					.attr('y', function (d) {
						return d.value < 0 ?
							that.scales.y(d.waterfall.startValue) :
							that.scales.y(d.waterfall.startValue) -
								(that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue));
					})
					.attr('fill', that.dataToColor)
					.each('start', function () {
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
					.duration(this.duration)
					.attr('x', function () { return that.width * 3; })
					.attr('opacity', 0)
					.each('end', function () { this.remove(); });
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

			this.yAxisLegend = this.svg.append('g');
			this.xAxisLegend = this.svg.append('g');

			this.yAxisLegend
				.attr('class', 'y-axis')
				.attr('transform', function () {
					return 'translate('+that.padding.left+',0)';
				})
				.call(this.yAxis);

			this.xAxisLegend
				.attr('class', 'x-axis')
				.attr('transform', function () {
					var pos = that.height - that.padding.bottom;
					return 'translate(0,' + pos + ')';
				})
				.call(this.xAxis);

			this.gridAxis = d3.svg.axis()
				.scale(that.scales.y)
				.orient('left')
				.tickSize(-that.width+that.padding.left, 0, 0)
				.tickFormat('');

			this.yGrid = this.svg.append('g')
				.attr('class', 'grid')
				.attr('transform', function () {
					return 'translate('+that.padding.left+', 0)';
				})
				.call(this.gridAxis)
				.moveToBack();

			this.svg.selectAll('.x-axis .tick text')
				.attr('transform', function () {
					var _dim = this.getBBox();
					var deltax = _dim.width/2,
						x = _dim.x+_dim.width,
						y = _dim.y;
					return 'translate(-' + deltax + ', 0) rotate(-45,' + x + ', ' + y + ')';
				});
			this.renderLegendText();
		},
		dataToColor: function (data) {
			return this.colors[data.value > 0 ? 'positive' : 'negative'];
		},
		legendCurrencySymbol: function() {
			var legendCurrencySymbol = {
				G: 'M €',
				M: 'm €',
			}[this.prefix.symbol];
			if (_.isUndefined(legendCurrencySymbol)) {
				legendCurrencySymbol = '€';
			}
			return legendCurrencySymbol;
		},
		legendText: function() {
			var legendText = {
				G: 'Milliards €',
				M: 'Millions €',
			}[this.prefix.symbol];
			if (_.isUndefined(legendText)) {
				legendText = 'En euros';
			}
			return legendText;
		},
		remove: function() {
			Backbone.View.prototype.remove.apply(this, arguments);
			$(window).off('resize');
		},
		render: function() {
			this.updateScales();
			if (this.model.get('waterfallData').length) {
				this.buildBars(this.buildActiveBars);
			}
			if(_.isUndefined(this.xAxis) && _.isUndefined(this.yAxis)) {
				this.buildLegend();
			} else {
				this.updateLegend();
			}
			return this;
		},
		renderLegendText: function () {
			var legendTextObject = this.svg.selectAll('.legend-text-y').data([this.legendText()]);
			legendTextObject
				.text(function (d) { return d; })
				.enter()
					.append('svg:text')
						.attr('class', 'legend-text-y')
						.attr('fill', '#333')
						.attr('x', _.bind(function () { return this.padding.left; }, this))
						.attr('y', function (d, i) { return 10 + i * 10; })
						.attr('font-size', 12)
						.attr('font-weight', 'normal')
						.attr('text-anchor', 'end');
			legendTextObject.exit().remove();
		},
		showTooltip: function (bar) {
			var d = bar.data()[0],
				that = this;
			// TODO Use handlebars.
			/* jshint multistr:true */
			this.$el.append('\
<div class="nvtooltip xy-tooltip nv-pointer-events-none" style="opacity: 0; position: absolute;">\
	<table class="nv-pointer-events-none">\
		<thead>\
			<tr class="nv-pointer-events-none">\
				<td colspan="3" class="nv-pointer-events-none">\
					<strong class="x-value">' + d.name + '</strong>\
				</td>\
			</tr>\
		</thead>\
		<tbody>\
			<tr class="nv-pointer-events-none">\
				<td>' + that.prefix._scale(d.value) + ' ' + this.legendCurrencySymbol() + '</td>\
			</tr>\
		</tbody>\
	</table>\
</div>');
			d3.select(this.el).select('.nvtooltip')
				.style('left', function () {
					var tooltipWidth = $(this).width();
					var xPos = bar.attr('x') - (that.width * 2/3 < bar.attr('x') ? tooltipWidth: 0);
					return xPos + 'px';
				})
				.style('top', function () { return bar.attr('y') + 'px'; })
				.transition()
					.duration(100)
					.style('opacity', 1);
		},
		updateDimensions: function() {
			this.width = this.$el.width() - this.margin.left - this.margin.right;
			this.height = this.width * 0.66 - this.margin.bottom - this.margin.top;
		},
		updateLegend: function () {
			var that = this;

			this.xAxis.scale(this.scales.x);
			this.yAxis.scale(this.scales.y);
			this.gridAxis.scale(this.scales.y);

			this.xAxisLegend
				.transition()
				.duration(this.duration)
				.attr('transform', function () {
					var pos = that.height - that.padding.bottom;
					return 'translate(0,' + pos + ')';
				})
				.call(this.xAxis);

			this.yAxisLegend
				.transition()
				.duration(this.duration)
				.call(this.yAxis);

			this.yGrid
				.transition()
				.duration(this.duration)
				.call(this.gridAxis);

			this.svg.selectAll('.x-axis .tick text')
				.attr('transform', function () {
					var _dim = this.getBBox();
					var deltax = _dim.width/2,
						x = _dim.x+_dim.width,
						y = _dim.y;
					return 'translate(-'+deltax+', 0) rotate(-45,'+x+', '+y+')';
				});
			this.renderLegendText();
		},
		updateScales: function () {
			var that = this;
			var waterfallData = this.model.get('waterfallData');
			var currentDataSetValues = _.map(waterfallData, function (data) {
				return [data.waterfall.startValue, data.waterfall.endValue];
			});
			var yMin, yMax;

			/* Set scales */
			yMin = d3.min(currentDataSetValues, function (d) { return d3.min(d);});
			yMax = d3.max(currentDataSetValues, function (d) { return d3.max(d);});
			this.scales = {
				x: d3.scale.ordinal()
					.rangeBands([this.padding.left, that.width-this.padding.right], 0, 0)
					.domain(_.map(waterfallData, function(d) { return d.short_name; })), // jshint ignore:line
				y: d3.scale.linear()
					.domain([yMin, yMax])
					.range([that.height - that.padding.bottom, that.padding.top])
			};

			var magnitude = (Math.abs(yMin) > Math.abs(yMax)) ? Math.abs(yMin): Math.abs(yMax);
			this.prefix = d3.formatPrefix(magnitude);
			this.prefix._scale = function (val) {
				if (that.prefix.symbol !== 'G' && that.prefix.symbol !== 'M' && that.prefix.symbol !== 'k' &&
					that.prefix.symbol !== '') {
					return ('' + d3.round(val, 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
				}
				var roundLevel = (that.prefix.symbol == 'G' || that.prefix.symbol == 'M') ? 2: 0;
				if(that.prefix.symbol == 'k') val = that.prefix.scale(val)*1000;
				else val = that.prefix.scale(val);
				return (''+ d3.round(val, roundLevel)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
			};
		},
		windowResize: function () {
			this.updateDimensions();
			this.render();
		},
	});

	return WaterfallChartV;
});
