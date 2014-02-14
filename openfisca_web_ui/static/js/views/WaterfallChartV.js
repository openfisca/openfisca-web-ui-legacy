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
			events: {},

			/* Properties */
			model: new DetailChartM(),
			views: [],

			/* Settings */
			padding: {
				top: 30,
				right: 0,
				bottom: 0,
				left: 0,
			},

			title: '',

			currentDataSet: {},
			bars: {},
			stopValues: {},

			/* Settings */

			initialize: function (parent) {
				if(_.isUndefined(parent)) console.error('Missing parent object in WaterfallChartV constructor');

				console.log('WaterfallChartV initialized');

				this.svg = parent.svg;
				this.height = parent.height;
				this.width = parent.width;

				this.listenTo(this.model, 'change:groupedDatasAll', this.render);
			},
			render: function () {
			    console.log('WaterfallChartV.render');
				this.setData(this.model.get('groupedDatasAll'));
				this.updateScales();
				this.buildBars();
//				this.buildLegend();
				return this;
			},

			setData: function (data) {
				/* Set stopvalues */
				var children = data.children,
					childrenLength = children.length,
					that = this;

				this.currentDataSet = $.extend({}, data);

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
						.rangeRoundBands([this.padding.left, that.width - this.padding.right], 0, .1)
						.domain(that.currentDataSet.children.map(function(d) {
							return d.name;
					})),
					y: d3.scale.linear()
							.domain([
								d3.min(currentDataSetValues, function (d) { return d3.min(d);}),
								d3.max(currentDataSetValues, function (d) { return d3.max(d);})
					]).range([that.height, 0])
				};
			},
			buildBars: function () {
				var that = this;
				this.svg.selectAll('rect')
					.data(this.currentDataSet.children)
					.enter()
						.append('rect')
						.attr('width', 60)
						.attr('height', function (d) {
							if(d.value < 0) return that.scales.y(d.waterfall.endValue) - that.scales.y(d.waterfall.startValue);
							else return that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue);
						})
						.attr('x', function (d, i, a) {
							return that.scales.x(d.name)+ d3.select(this).attr('width')/4;
						})
						.attr('y', function (d, i) {
							if(d.value < 0) var r = that.scales.y(d.waterfall.startValue);
							else var r = that.scales.y(d.waterfall.startValue) - (that.scales.y(d.waterfall.startValue) - that.scales.y(d.waterfall.endValue));
							return r + that.padding.top;
						})
						.attr('fill', function (d) {
							if(d.value > 0) return '#4B52A0';
							else return '#C11137';
						});
			},
			buildLegend: function () {

				var that = this;

				this.xAxis = d3.svg.axis()
					.scale(this.scales.x)
					.orient("bottom");

				this.yAxis = d3.svg.axis()
					.scale(this.scales.y)
					.orient("left")
					.tickFormat(d3.format(".1s"));


				this.svg.append("g")
					.attr("class", "y_axis")
					.attr('height', that.height)
					.call(this.yAxis)
						// .append("text")
						// 	.attr("transform", "rotate(-90)")
						// 	.attr("y", 6)
						// 	.attr("dy", ".71em")
						// 	.style("text-anchor", "end")
						// 	.text("Revenu disponible");

				this.svg.append("g")
					.attr("class", "x_axis")
					.attr("transform", "translate(0," + that.height - 20 + ")")
					.call(this.xAxis)
			}
		});
	return WaterfallChartV;
});
