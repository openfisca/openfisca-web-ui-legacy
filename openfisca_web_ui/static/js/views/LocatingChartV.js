define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'nvd3',

	'appconfig',
	'helpers',
	'LocatingChartM',
],
function ($, _, Backbone, d3, nv, appconfig, helpers, LocatingChartM) {
	'use strict';

	nv.dev = false;

	if ( ! appconfig.enabledModules.locatingChart) {
		return;
	}

	var LocatingChartV = Backbone.View.extend({
		chart: null,
		code: null,
		height: null,
		// FIXME margin is a padding?
		margin: {
			top: 0,
			left: 0,
			bottom: 0,
			right: 20
		},
		minHeight: 300,
		model: null,
		userPointColor: '#a63232',
		width: null,
		initialize: function(options) {
			this.code = options.code;
			this.model = new LocatingChartM({code: this.code});
			this.svg = d3.select(this.el).append('svg');
			this.listenTo(this.model, 'change:data', this.render);
		},
		computeUserPoint: function() {
			var data = this.model.get('data');
			var vingtiles = this.model.get('vingtiles');
			var userPoint = {
				y: data.values[0],
			};
			var userPointYIndex = _.sortedIndex(vingtiles.values, userPoint, 'y');
			var higher = vingtiles.values[userPointYIndex];
			if (userPointYIndex === 0) {
				userPoint.x = higher.x;
			} else if (userPointYIndex === vingtiles.values.length) {
				userPoint.x = 99;
			} else {
				var lower = vingtiles.values[userPointYIndex - 1];
				var dY = higher.y - lower.y;
				var dy = userPoint.y - lower.y;
				var dX = higher.x - lower.x;
				var dx = dX * dy / dY;
				userPoint.x = d3.round(lower.x + dx);
			}
			return userPoint;
		},
		formatNumber: function(value) {
			var scaledValue = this.prefix.scale(value);
			if (this.prefix.symbol === 'k') {
				scaledValue *= 1000;
			}
			return d3.round(scaledValue, 2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
		},
		legendCurrencyText: function() {
			var legendCurrencyTextBySymbol = {
				G: 'milliards €',
				M: 'millions €',
			};
			return this.prefix.symbol in legendCurrencyTextBySymbol ? legendCurrencyTextBySymbol[this.prefix.symbol] :
				'€';
		},
		legendText: function() {
			var legendTextBySymbol = {
				G: 'revenu en milliards €',
				k: 'revenu en milliers €',
				M: 'revenu en millions €',
			};
			return this.prefix.symbol in legendTextBySymbol ? legendTextBySymbol[this.prefix.symbol] : 'revenu en €';
		},
		render: function () {
			this.updateDimensions();
			this.svg
				.attr('height', this.height)
				.attr('width', this.width);
			nv.addGraph(_.bind(function() {
				var vingtiles = this.model.get('vingtiles');
				var userPoint = this.computeUserPoint();
				userPoint.isUserPoint = true;
				var values = _.sortBy(vingtiles.values.concat(userPoint), 'x');
				var datum = {key: vingtiles.key, values: values};
				this.prefix = d3.formatPrefix(d3.max(values, function (value) { return value.y; }));
				var chart = nv.models.lineChart()
					.transitionDuration(100)
					.showLegend(true)
					.showYAxis(true)
					.showXAxis(true)
					.useInteractiveGuideline(true);
				chart.interactiveLayer.tooltip.contentGenerator(_.bind(this.tooltipContent, this));
				chart.xAxis
					.axisLabel('% de la population')
					.tickFormat(d3.format(',r'));
				chart.yAxis
					.axisLabel(this.legendText())
					.tickFormat(_.bind(this.formatNumber, this));
				this.svg.datum([datum]).call(chart);
				_.each(datum.values, function (value, valueIdx) {
					var point = d3.select('.nv-series-' + value.series + ' .nv-point-' + valueIdx);
					if (value.isUserPoint) {
						point
							.style('fill', this.userPointColor)
							.style('fill-opacity', 1)
							.style('stroke', this.userPointColor)
							.style('stroke-opacity', 1)
							.style('stroke-width', 8);
					} else {
						// Reset point style from one render to another..
						point
							.style('fill-opacity', 0)
							.style('stroke-opacity', 0)
							.style('stroke-width', 0);
					}
				}, this);
				chart.update();
			}, this));
		},
		tooltipContent: function (d) {
			var that = this;
			var table = d3.select(document.createElement('table'));
			var theadEnter = table.selectAll('thead')
				.data([d])
				.enter().append('thead');
			theadEnter.append('tr')
				.append('td')
				.attr('colspan', 3)
				.append('strong')
					.classed('x-value', true)
					.html(d.value + ' % des français ont un');
			var tbodyEnter = table.selectAll('tbody')
				.data([d])
				.enter().append('tbody');
			var trowEnter = tbodyEnter.selectAll('tr')
				.data(function(p) { return p.series; })
				.enter()
				.append('tr')
				.classed('highlight', function(p) { return p.highlight; })
				;
			trowEnter.append('td')
				.classed('legend-color-guide', true)
				.append('div')
				.style('background-color', function(p) { return p.color; });
			trowEnter.append('td')
				.classed('key', true)
				.html(function (p) { return p.key + ' inférieur à : '; });
			trowEnter.append('td')
				.classed('value', true)
				.html(function(p) { return that.formatNumber(p.value) + ' ' + that.legendCurrencyText(); });
			trowEnter.selectAll('td').each(function(p) {
				if (p.highlight) {
					var opacityScale = d3.scale.linear().domain([0, 1]).range(['#fff', p.color]);
					var opacity = 0.6;
					d3.select(this)
						.style('border-bottom-color', opacityScale(opacity))
						.style('border-top-color', opacityScale(opacity));
				}
			});
			return table.node().outerHTML;
		},
		updateDimensions: function () {
			this.width = this.$el.width() - this.margin.left - this.margin.right;
			this.height = Math.max(this.minHeight, this.width * 0.66) - this.margin.bottom - this.margin.top;
		},
	});

	return LocatingChartV;
});
