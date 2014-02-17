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
				console.info('DistributionChartV initialized');

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
					datas.distribution = {};

					if(_.isUndefined(datas.children)) datas.distribution.fictive = false;
					else that.currentDataSetContainer.push(datas);

					_.each(datas.children, function (data) {
						if(datas.children.length == 1) datas.distribution.fictive = true;
						else data.distribution = datas.distribution.fictive = false;
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

				var nodes = this.pack.nodes(datas),
					containerNodes = this.pack.nodes(containerDatas);

				this.circles = this.g.selectAll("circle")
					.data(nodes)
				// this.paths = this.g.selectAll("path")
				// 	.data(containerNodes)

				/* Append / enter */
				this.circles
					.enter().append("svg:circle")
						.attr("class", function(d) { return d.children ? "parent" : "child"; })
						.attr("cx", function(d) { return d.x; })
						.attr("cy", function(d) { return d.y; })
						.attr("r", function(d) {
							return 0;
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
						.attr('class', function (d) {
							return d.name;
						});

				// this.paths
				// 	.enter().append('svg:path')
				// 	.attr("fill", function(d, i) { return 'none'; })
				//     .attr('stroke', 'blue')
				// 	.attr("d", function (d) {
				// 		console.log(d);
				// 		return d3.svg.arc()
				// 		    .innerRadius(d.r*1.03)
				// 		    .outerRadius(d.r*1.03)
				// 		    .startAngle(5)
				// 		    .endAngle(10);
				// 	})
				// 	.attr('transform', function (d) { return 'translate('+d.x+','+d.y+')'; });

				/* Update / transition */
				this.circles
					.transition()
					.duration(1000)
					.attr("r", function(d) {
						console.log('transition');
						return d.r - ((!_.isUndefined(d.distribution) && d.distribution.fictive == true && !d.children) ? 3:0);
					})
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; })
					.attr('stroke', function (d) {
						return d.children ? '#666' : 'none';
					})
					.attr('stroke-dasharray', function (d) {
						return d.children ? '10,10' : 'none';
					})

				/* Delete / exit */
				this.circles.exit()
					.transition()
						.duration(1000)
						.attr('x', function (d, i, a) {
							return that.width*3;
						})
						.attr('opacity', 0)




						// .each(function (d, i) {
						// 	/* move */
						// 	if(_.isUndefined(d.distribution)) d.distribution = {fictive: false};

						// 	if(!d.children || d.r < 30 || d.distribution.fictive) return;

						// 	var arc = d3.svg.arc()
						// 		    .innerRadius(d.r*1.03)
						// 		    .outerRadius(d.r*1.03)
						// 		    .startAngle(5)
						// 		    .endAngle(10);

						// 	d.distribution.path = that.g.append('path')
						// 		.attr('id', 'path-0-'+i)
						// 		.attr("fill", function(d, i){
						// 	        return 'none';
						// 	    })
						// 	    .attr('stroke', 'none')
						// 		.attr("d", arc)
						// 		.attr('transform', function (_d) {
						// 			return 'translate('+d.x+','+d.y+')';
						// 		});

						// 	var textSize = 8 + Math.sqrt(d.r);
						// 	d.distribution.text = that.g.append('text')
						// 	  .append("textPath")
						// 	  .attr('class', 'text-path-0-'+i)
						// 	  .attr("xlink:href",'#path-0-'+i)
						// 	  .attr('font-size', textSize+'px')
						// 	  .attr('fill', '#444')
						// 	  .attr('opacity', 0)
						// 	  .text(function(){return d.name;})
						// });


				
					// .each('start', function (d, i) {

					// 	var dis = d.distribution || {};

					// 	if(!_.isUndefined(dis.path)) dis.path.remove();
					// 	if(!_.isUndefined(dis.text)) dis.text.remove();

					// 	console.log(dis);
					// })
					// .each('end', function (d, i) {
					// 	/* move */

					// 		if(_.isUndefined(d.distribution)) d.distribution = {fictive: false};
					// 		if(!d.children || d.r < 30 || d.distribution.fictive) return;

					// 		var arc = d3.svg.arc()
					// 			.innerRadius(d.r*1.03)
					// 			.outerRadius(d.r*1.03)
					// 			.startAngle(5)
					// 			.endAngle(10);

					// 		d.distribution.path = that.g.append('path')
					// 			.attr('id', 'path-0-'+i)
					// 			.attr("fill", function(d, i){
					// 		        return 'none';
					// 		    })
					// 			.attr('stroke', 'none')
					// 		    .attr("d", arc)
					// 			.attr('transform', function (_d) {
					// 				return 'translate('+d.x+','+d.y+')';
					// 			});

					// 		var textSize = 8 + Math.sqrt(d.r);
					// 		d.distribution.text = that.g.append('text')
					// 		  .append("textPath")
					// 		  .attr('class', 'text-path-0-'+i)
					// 		  .attr("xlink:href",'#path-0-'+i)
					// 		  .attr('font-size', textSize+'px')
					// 		  .attr('fill', '#444')
					// 		  .attr('opacity', 1)
					// 		  .text(function(){return d.name;})
					// });


					
							// .each('end', function (d) {
							// 	if(!_.isUndefined(d.distribution.path))
							// 		d.distribution.path.transition().duration(500)
							// 			.attr('opacity', 0).each(function () {this.remove()});

							// 	if(!_.isUndefined(d.distribution.text))
							// 		d.distribution.text.transition().duration(500)
							// 			.attr('opacity', 0).each(function () {this.remove()});

							// 	this.remove();
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
