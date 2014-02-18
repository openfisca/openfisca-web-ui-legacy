define([
	'jquery',
	'underscore',
	'backbone',
	'd3',

	'DistributionChartM',
	'helpers',
	], function ($, _, Backbone, d3, DistributionChartM, helpers) {
		'use strict';

		var DistributionChartV = Backbone.View.extend({

			events: {
				'click circle.parent': 'hoverParentCircle'
			},

			/* Settings */
			model: new DistributionChartM,
			views: [],
			datakey: '',

			/* Properties */

			padding: {
				top: 20,
				left: 20,
				bottom: 20,
				right: 20
			},
			packPadding: 20,

			bubbles: [],
			d_bubbles: undefined,

			initialize: function (parent) {
				this.g = parent.svg.append('g').attr('id', 'distribution-chart');
				this.setElement(this.g[0]);

				this.height = parent.height;
				this.width = parent.width;

				this.listenTo(this.model, 'change:datas', this.render);
				if(!_.isEmpty(this.model.get('datas'))) this.render();
			},
			render: function () {
				this.setData(this.model.get('datas'));
				this.buildLayoutGlobal();
			},

			setData: function (data) {
				this.currentDataSet = $.extend(true, {}, this.model.get('datas'));
				this.currentDataSetContainer = [];
				var that = this;

				var defineFictiveDataGroup = function (datas) {

					if(_.isUndefined(datas.distribution)) datas.distribution = {};

					_.each(datas.children, function (data) {
						data.distribution = {};
						if(datas.children.length == 1) data.distribution.fictive = true;
						else data.distribution.fictive = false;
						defineFictiveDataGroup(data);
					});
				};
				defineFictiveDataGroup(this.currentDataSet);
			},
			buildLayoutGlobal: function () {
				var that = this,
					datas = this.currentDataSet,
					containerDatas = this.currentDataSetContainer;

				if(_.isUndefined(this.pack)) {
					this.pack = d3.layout.pack()
					.size([this.width, this.height])
					.value(function (d) {
						d._value = d.value;
						return Math.abs(d.value);
					})
					.padding(this.packPadding)
				}

				var nodes = this.pack.nodes(datas);

				this.circles = this.g.selectAll('circle')
					.data(nodes);
				this.paths = this.g.selectAll('path')
					.data(nodes);
				this.texts = this.g.selectAll('text')
					.data(nodes);


				/* Circles */
				this.circles
					.enter().append("svg:circle")
						.attr("cx", function(d) { return d.x; })
						.attr("cy", function(d) { return d.y; })
						.attr("r", function(d) {
							return d.children ? d.r: 0;
						})
						.attr('fill', function (d) {
							if(!d.children) {
								if(d._value > 0) return '#5cb85c';
								else return '#C11137';
							}
							else return 'none';
						})
						.attr('stroke-width', 2)
						.attr('stroke', function (d) {
							return d.children ? '#666' : 'none';
						})
						.attr('stroke-dasharray', function (d) {
							return d.children ? '10,10' : 'none';
						})
						.attr('opacity', 0)

				this.circles
					.attr("class", function(d) { return d.children ? "parent" : "child"; })

				this.circles
					.transition()
					.duration(1000)
					.attr("r", function(d) { return d.r - ((d.distribution.fictive == true && !d.children) ? 5:0); })
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; })
					.attr('stroke', function (d) { return d.children ? '#666' : 'none'; })
					.attr('fill', function (d) {
						if(!d.children) {
							if(d._value > 0) return '#5cb85c';
							else return '#C11137';
						}
						else return '#FFF';
					})
					.attr('stroke-dasharray', function (d) { return d.children ? '10,10' : 'none'; })
					.attr('fill-opacity', function (d) { return (d3.select(this).attr('class') == 'parent')? 0: 1; })
					.attr("opacity", 1);

				this.circles.exit()
					.transition()
						.duration(1000)
						.attr('opacity', 0)
						.each('end', function () {
							this.remove();
						});


				/* Paths */

				this.paths.exit()
					.transition()
						.duration(1000)
						.attr('opacity', 0)
						.each('end', function () {
							this.remove();
						});

				this.paths
					.enter().append('svg:path')
					.attr("stroke", function(d, i) { return 'blue'; })
					.attr('d', function (d) {
						var arc = d3.svg.arc()
						    .innerRadius(d.r*1.03)
						    .outerRadius(d.r*1.03)
						    .startAngle(5)
						    .endAngle(10);
						return arc();
					})
					.attr('transform', function (d) { return 'translate('+d.x+','+d.y+')'; });

				this.paths
					.attr('id', function (d, i) { return 'path-parent-'+i; })

				this.paths
					.transition()
						.duration(1000)
						.attr('d', function (d, i) {
							var arc = d3.svg.arc()
							    .innerRadius(d.r*1.02)
							    .outerRadius(d.r*1.02)
							    .startAngle(5)
							    .endAngle(10);
							return arc();
						})
						.attr('opacity', 0)
						.attr('transform', function (d) { return 'translate('+d.x+','+d.y+')'; });

				/* Texts */

				this.texts.exit()
					.transition()
						.duration(1000)
						.attr('opacity', 0)
						.each('end', function () {
							this.remove();
						});

				this.textsPaths =
					this.texts
						.enter()
						.append('svg:text')
						.append('svg:textPath')
						.attr('display', function (d) {
							return (d.distribution.fictive || !d.children) ? 'none': 'block';
						})
						.attr("xlink:href", function (d, i) {
							return '#path-parent-'+i;
						})
						.attr('font-size', function (d, i) {
							var fs = 8 + Math.sqrt(d.r);
							return fs+'px';
						})
						.attr('fill', '#222')
						.attr('opacity', 0)
						.text(function(d){ return d.name; });
				
				this.textsPaths
					.attr('id', function (d, i) { return 'text-parent-'+i; })

				this.textsPaths
					.transition()
						.duration(1000)
						.attr('font-size', function (d, i) {
								var fs = 8 + Math.sqrt(d.r);
								return fs+'px';
						})
						.attr('opacity', function (d, i) {
							return (d.distribution.fictive || !d.children) ? 0: 0.3;
						});

				this.globalLayoutEvents();
			},
			globalLayoutEvents: function () {
				var that = this;
				// this.circles
				// .filter(function (d) { return d.children; })
				// .on('mouseover', function (d, i) {
				// 	d3.select('#text-parent-'+i)
				// 		.transition()
				// 			.duration(200)
				// 			.attr('opacity', 1)
				// 			.attr('font-size', 15 + Math.sqrt(d.r));
				// })
				// .on('mouseout', function (d, i) {
				// 	d3.select('#text-parent-'+i)
				// 		.transition()
				// 			.duration(200)
				// 			.attr('opacity', 0.3)
				// 			.attr('font-size', 8 + Math.sqrt(d.r));
				// });
			},
			buildLayoutPositive: function () {
				this.packs = [];
				var datas = $.extend(true, {}, this.model.get('groupedDatas.positive'));

				this.pack = d3.layout.pack()
							.size([this.width/2, this.height])
							.value(function (d) {
								return Math.abs(d.value);
							});

				var nodes = [];
				_.each(datas, function (d) {
					nodes.push(this.pack.nodes(d));
				}.bind(this));

				_.each(nodes, function () {
					
				}.bind(this));
			}
		});
	return DistributionChartV;
});
