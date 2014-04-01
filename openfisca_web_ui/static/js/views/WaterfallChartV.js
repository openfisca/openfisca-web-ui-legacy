define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'chartM',
	'parser',
], function ($, _, Backbone, d3, chartM, Parser) {
	'use strict';

	var WaterfallChartV = Backbone.View.extend({
		barLeftAndRightPadding: 10,
		bars: [],
		colors: {
			negative: '#b22424',
			positive: '#6aa632',
		},
		data: null,
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
			var barWidth = (that.width - that.padding.left - that.padding.right) / this.data.length;
			this.activeBars = this.svg.selectAll('.active-bar').data(this.data);
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
					.on('mouseover', function (barData, barIdx) {
						var bar = d3.select('#bar-' + barIdx);
						that.showTooltip(bar);
						that.bars
							.transition()
							.duration(this.duration)
							.attr('opacity', function (d, i) { return i == barIdx ? 1 : 0.8; });
						if (barData.parentNodes.length > 0) {
							that.renderIncome(barData, barIdx);
						}
					})
					.on('mouseout', function (d, i) {
						var bar = d3.select('#bar-' + i);
						d3.select(this)
							.transition()
							.duration(that.duration)
							.attr('opacity', 0);
						that.bars
							.transition()
							.duration(that.duration)
							.attr('opacity', 1);
						bar.attr('stroke-width', 1);

						d3.select(that.el).select('.nvtooltip')
							.transition()
							.duration(that.duration)
							.style('opacity', 0)
							.remove();

						if( ! _.isUndefined(that.incomeLabel)) {
							that.incomeLabel.remove();
							that.incomeLine.remove();
							that.incomeLine2.remove();
							that.incomeLine3.remove();
							that.incomeText.remove();
						}
					});
			this.activeBars
				.transition()
					.duration(this.duration)
					.attr('width', barWidth)
					.attr('height', that.height)
					.attr('x', function (d) { return that.scales.x(d.short_name); }) // jshint ignore:line
					.attr('y', this.padding.top)
					.attr('fill', that.dataToColor)
					.attr('opacity', 0);
			this.activeBars.exit().remove();
		},
		buildBars: function (endTransitionCallback) {
			var that = this;
			var barWidth = (this.width - this.padding.left - this.padding.right -
				this.barLeftAndRightPadding * this.data.length) / this.data.length;
			var realBarWidth = Math.min(barWidth, this.maxBarWidth);
			this.bars = this.svg.selectAll('.bar').data(this.data);
			this.bars
				.enter()
					.append('rect')
					.attr('id', function (d, i) { return 'bar-' + i; })
					.attr('class', 'bar')
					.attr('rx', 4)
					.attr('ry', 4)
					.attr('fill', that.dataToColor)
					.attr('opacity', 1)
					.attr('stroke-width', 1);
			this.bars
				.transition()
					.duration(this.duration)
					.attr('width', realBarWidth)
					.attr('height', function (d) {
						var height = d.value < 0 ?
							that.scales.y(d.waterfall.endValue) - that.scales.y(d.waterfall.startValue) :
							that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue);
						return Math.max(height, that.minBarHeight);
					})
					.attr('x', function (d) {
						return that.scales.x(d.short_name) + barWidth / 2 - realBarWidth / 2; // jshint ignore:line
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
						if(!_.isUndefined(that.incomeLine)) {
							that.incomeLine.transition().duration(that.duration).remove();
						}
						if(!_.isUndefined(that.incomeText)) {
							that.incomeText.transition().duration(that.duration).remove();
						}
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
		computeData: function() {
			// TODO Internalize setParentNodes and listChildren in WaterfallChartM which are used only in waterfall.
			var data = new Parser(chartM.get('source')).clean().setParentNodes().listChildren().values();
			var currentStartValue = 0, currentEndValue = 0;
			_.each(data, function (item) {
				currentEndValue += item.value;
				item.waterfall = {
					startValue: currentStartValue,
					endValue: currentEndValue,
				};
				currentStartValue += item.value;
			});
			return data;
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
			var that = this;
			this.data = this.computeData();
			this.updateScales();
			if (this.data.length) {
				this.buildBars(this.buildActiveBars);
			}
			if(_.isUndefined(this.xAxis) && _.isUndefined(this.yAxis)) {
				this.buildLegend();
			} else {
				this.updateLegend();
			}
//			var revdispData = _.findDeep(this.model.get('cleanData'), {code: 'revdisp' });
//			if ( ! _.isUndefined(revdispData)) {
//				_.each(this.bars.data(), function(barData, barIdx) {
//					if ( ! _.isUndefined(barData.parentNodes) && barData.parentNodes.length > 0 &&
//						barData.parentNodes[0].id === 'root') {
//						that.renderIncome(barData, barIdx);
//					}
//				});
//			}
			return this;
		},
		renderIncome: function(barData, barIdx) {
			var that = this;
			var bar = d3.select('#bar-' + barIdx);
			var barAttrs = {
				fill: bar.attr('fill'),
				x: parseInt(bar.attr('x')),
				y: parseInt(bar.attr('y')),
				width: parseInt(bar.attr('width')),
				height: parseInt(bar.attr('height')),
			};

			var deeperFirstChild = function (node) {
				return ! _.isUndefined(node.children) && node.children.length > 0 ?
					deeperFirstChild(node.children[0]) : node;
			};

			var firstParentNode = barData.parentNodes[0];
			var firstParentNodeFirstChild = _.findWhere(
				this.data,
				{
					_id: deeperFirstChild(
						_.findDeep(this.model.get('cleanData'), {_id: firstParentNode.id })
					)._id,
				});
			var yMiddleTextPos = (barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0)) +
				(this.scales.y(firstParentNodeFirstChild.waterfall.startValue) - (barAttrs.y +
				(barData.value < 0 ? (barAttrs.height) : 0)))/2;

			var y = barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0);
			this.incomeLine = this.svg.append('line')
				.attr('stroke', '#333')
				.attr('stroke-width', 2)
				.attr('stroke-dasharray', ('3, 3'))
				.attr('opacity', 0)
				.attr('x1', barAttrs.x)
				.attr('y1', y)
				.attr('x2', this.width)
				.attr('y2', y)
				.moveToBack();

			this.incomeLine2 = this.svg.append('line')
				.attr('stroke', '#333')
				.attr('stroke-width', 2)
				.attr('stroke-dasharray', ('3, 3'))
				.attr('opacity', 0)
				.attr('x1', function () {
					return that.scales.x(firstParentNodeFirstChild.short_name); // jshint ignore:line
				})
				.attr('y1', function () {
					return that.scales.y(firstParentNodeFirstChild.waterfall.startValue);
				})
				.attr('x2', this.width)
				.attr('y2', function () { return that.scales.y(firstParentNodeFirstChild.waterfall.startValue); })
				.moveToBack();

			this.incomeLine3 = this.svg.append('line')
				.attr('stroke', '#333')
				.attr('stroke-width', 7)
				.attr('opacity', 0)
				.attr('x1', this.width - 10)
				.attr('y1', function () { return (barAttrs.y + (barData.value < 0 ? (barAttrs.height) : 0)); })
				.attr('x2', this.width - 10)
				.attr('y2', function () { return that.scales.y(firstParentNodeFirstChild.waterfall.startValue); });

			this.incomeText = this.svg.selectAll('.income-number')
				.data([this.prefix._scale(firstParentNode.value) + ' ' + this.legendCurrencySymbol()]);

			this.incomeText
				.exit()
					.transition().duration(this.duration)
					.attr('opacity', 0)
					.remove();

			this.incomeText
				.enter()
					.append('text')
					.attr('class', 'income-number')
					.attr('font-size', 15)
					.attr('x', this.width + 5)
					.attr('y', function (_d, _i) {
						var lineHeight = parseInt(d3.select(this).attr('font-size')) + 3;
						return yMiddleTextPos + lineHeight * _i -
							(that.incomeText.data().length * lineHeight-10);
					})
					.attr('font-weight', 'bold')
					.text(function (_d) { return _d; });

			this.incomeLabel = this.svg.selectAll('.income-label')
				.data(firstParentNode.name.split(' '));
			this.incomeLabel
				.enter()
					.append('text')
					.attr('class', 'income-label')
					.attr('font-size', 12)
					.attr('font-weight', 'bold')
					.attr('x', that.width + 5)
					.attr('y', function (d, i) {
						var lineHeight = parseInt(d3.select(this).attr('font-size')) + 3;
						return yMiddleTextPos + lineHeight + i * lineHeight;
					})
					.text(function (d) { return d; });
			this.incomeLabel.exit().transition().duration(this.duration).remove();
			this.incomeLine.transition().duration(this.duration).attr('opacity', 1);
			this.incomeLine2.transition().duration(this.duration).attr('opacity', 1);
			this.incomeLine3.transition().duration(this.duration).attr('opacity', 1);
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
			var that = this;
			var d = bar.data()[0];
			// TODO Use handlebars.
			/* jshint multistr:true */
			var tooltipHtml = '\
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
				<td>' + this.prefix._scale(d.value) + ' ' + this.legendCurrencySymbol() + '</td>\
			</tr>\
		</tbody>\
	</table>\
</div>';
			var $nvtooltip = this.$el.find('.nvtooltip');
			if ($nvtooltip.size() === 0) {
				this.$el.append(tooltipHtml);
			} else {
				$nvtooltip.replaceWith($(tooltipHtml));
			}
			d3.select(this.el).select('.nvtooltip')
				.style('left', function () {
					var tooltipWidth = $(this).width();
					var xPos = bar.attr('x') - (that.width * 2/3 < bar.attr('x') ? tooltipWidth: 0);
					return xPos + 'px';
				})
				.style('top', function () { return bar.attr('y') + 'px'; })
				.transition()
					.duration(this.duration)
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
			var currentDataSetValues = _.map(this.data, function (data) {
				return [data.waterfall.startValue, data.waterfall.endValue];
			});
			var yMin, yMax;

			/* Set scales */
			yMin = d3.min(currentDataSetValues, function (d) { return d3.min(d); });
			yMax = d3.max(currentDataSetValues, function (d) { return d3.max(d); });
			this.scales = {
				x: d3.scale.ordinal()
					.rangeBands([this.padding.left, that.width-this.padding.right], 0, 0)
					.domain(_.map(this.data, function(d) { return d.short_name; })), // jshint ignore:line
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
