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

		var DistributionChartV = Backbone.View.extend({
			model: chartM,

			defaultSort: 'positive',
			currentSort: null,
			headHeight: 50,
			height: null,
			width: null,
			maxWidth: 1000,
			padding: {top: 100, left: 20, bottom: 40, right: 20},
			minSectionHeight: 300,
			sectionWidth: null,
			sectionHeight: null,
			sectionBottomMargin: 30,

			defaultPackByLine: 3,
			packByLine: null,

			/* D3 Settings */
			force: d3.layout.force(),
			gravity: 0.02,
			charge: function (d) { return -Math.pow(d.radius/2, 2.0)/2; },
			friction: 0.6,
			rScale: d3.scale.linear().clamp(true),
			defaultGravity: 0.5,

			nodes: [],
			bubbles: {},
			positiveColor: '#6aa632',
			negativeColor: '#b22424',

			prefix: null,

			/* Sort */
			defaultSortData: {
				'positive': {
					'name': 'Cotisations / prestations',
					'children': [
						{ name: 'Cotisations', value: false },
						{ name: 'Prestations', value: true }
					]
				}
			},
			initialize: function (options) {
				this.updateDimensions();

				this.$el.append('<div id="sort-menu" class="btn-group"></div>');

				this.g = d3.select(this.el).append('svg')
					.attr('height', this.height)
					.attr('width', this.width);

				this.legendText = this.g.append('g')
					.attr('class', 'text-label');

				this.currentSort = this.defaultSort;
				
				this.listenTo(this.model, 'change:source', this.render);
			},
			render: function (sortType) {
				if(typeof sortType != 'string') sortType = this.currentSort;

				this.updateDimensions();

				var data = this.model.get('distributionData', {type: sortType});

				this.setSortDataByDataset(data);

				if(_.isUndefined(this.sortData[sortType])) {
					sortType = this.defaultSort;
				}
				var sortDatum = this.sortData[sortType];
				this.packByLine = sortDatum.children.length < this.defaultPackByLine ? sortDatum.children.length : this.defaultPackByLine;

				this.setSectionsDimensions();
				this.setPrefix(data);

				this.sortBubblesBy(sortType, data);
				this.setHeader(sortType);
			},
			/* Check "sort" (decomposition) values in data and update sortData */
			setSortDataByDataset: function (data) {
				var sortData = $.extend(true, {}, this.defaultSortData),
					cleanData = this.model.get('cleanData'); /* Get it to find decomposition names */

				_.each(data, function (d) {
					_.each(d.sorts, function (sortValue, sortKey) {
						if(!sortData.hasOwnProperty(sortKey)) {
							sortData[sortKey] = {
								name: _.findDeep(cleanData, {code: sortKey}).name,
								children: []
							};
						}
						if(_.isUndefined(_.findWhere(sortData[sortKey].children, {value: sortValue}))) {
							sortData[sortKey].children.push({
								name: _.findDeep(cleanData, {code: sortValue}).name,
								value: sortValue
							});
						}
					});
				});
				this.sortData = sortData;
			},
			/* Define bubble groups position and dimensions and the rscale (scale for bubble sizes) */
			setSectionsDimensions: function () {
				this.sectionWidth = this.innerWidth / (this.packByLine);
				this.quarterWidth = this.sectionWidth / 2;
				this.sectionHeight = this.minSectionHeight + this.sectionBottomMargin;
				this.rScale.range([2, (this.sectionWidth < this.sectionHeight ? this.sectionWidth : this.sectionHeight)/4]);
			},
			/* Set prefix for number displays */
			setPrefix: function (data) {
				var yMin = d3.min(data, function (d) { return d.value; }),
					yMax = d3.max(data, function (d) { return d.value; }),
					magnitude = (Math.abs(yMin) > Math.abs(yMax)) ? Math.abs(yMin): Math.abs(yMax),
					that = this;

				this.prefix = d3.formatPrefix(magnitude);
				/* Number formating */
				this.prefix._scale = function (val) {
					if (that.prefix.symbol !== 'G' && that.prefix.symbol !== 'M' && that.prefix.symbol !== 'k' && that.prefix.symbol !== '') {
						return (""+ d3.round(val, 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
					}
					var roundLevel = (that.prefix.symbol == 'G' || that.prefix.symbol == 'M') ? 2: 0;
					if(that.prefix.symbol == 'k') val = that.prefix.scale(val)*1000;
					else val = that.prefix.scale(val);
					return (""+ d3.round(val, roundLevel)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
				};

				switch(this.prefix.symbol) {
					case 'G': this.prefix.symbolText = 'milliards €';
						break;
					case 'M': this.prefix.symbolText = 'millions €';
						break;
					case 'k': this.prefix.symbolText = '€';
						break;
					case '': this.prefix.symbolText = '€';
						break;
					default:
						this.legendText = '';
				}
			},
			/* Set tabs in chart header */
			setHeader: function (sortType) {
				var $sortMenu = this.$el.find('#sort-menu'),
					that = this;
				$sortMenu.html('');
				for(var prop in this.sortData) {
					$sortMenu
						.append('<input class="btn btn-default '+prop+'-sort '+((prop == sortType)?'active':'')+'" data-sort="'+prop+'" type="button" value="'+this.sortData[prop].name+'">');
				}
				$sortMenu.off('click');
				$sortMenu.on('click', 'input', function () {
					if(!$(this).hasClass('active')) {
						that.render($(this).data('sort'));
					}
				});
			},
			/* Make sort according to sort type and bubble data */
			sortBubblesBy: function (sortType, data) {
				this.currentSort = sortType;
				this.rScale.domain([0, d3.max(data, function (d) { return Math.abs(d.value); })]);
				this.updateNodes(data);

				/* Add index to sort data values */
				_.each(this.sortData[sortType].children, function (d, i) { d.index = i; });
				this.buildBubbles(this.nodes);
				this.buildTextLegend();
				this.resize({'height': Math.ceil(this.sortData[sortType].children.length / this.packByLine)*this.sectionHeight + this.padding.top + this.padding.bottom});
				this.start();
			},
			/* Update chart dimensions */
			updateDimensions: function() {
				this.width = Math.min(this.$el.width(), this.maxWidth);
				this.height = this.width;
				this.innerWidth = this.width - this.padding.left - this.padding.right;
				this.innerHeight = this.height - this.padding.top - this.padding.bottom;
			},
			/* Parse data to be able to use them with bubbles */
			updateNodes: function (nodes) {
				var that = this;
				var outputNodes = _.map(nodes, function (node, i) {
					/* If node already doesn't exist, we create it, else we update it */
					var oldNode = _.findWhere(that.nodes, {'_id': node._id });
					var out = {};
					if(!_.isUndefined(oldNode)) {
						out = {
							x: oldNode.px,
							y: oldNode.py
						};
					}
					out._id = node._id;
					out.value = node.value;
					out.radius = that.rScale(Math.abs(node.value));
					out.fillColor = (node.value > 0) ? that.positiveColor: that.negativeColor;
					out.name = node.name;
					out.description = node.description;
					if(!_.isUndefined(node.sorts)) out.sorts = node.sorts;

					return out;
				});
				this.nodes = outputNodes;
			},
			/* Build legend : group titles */
			buildTextLegend: function () {
				var that = this;
				this.$el.find('.text-label').html('');
				_.each(this.sortData[this.currentSort].children, function (d, i) {

					var x = (that.sectionWidth * (i % that.packByLine)) + that.quarterWidth,
						y = that.sectionHeight * (Math.floor(i / that.packByLine)) + that.sectionHeight;

					that.legendText.append('text')
						.attr('class', 'section-title')
						.attr('x', x)
						.attr('y', y)
						.text(d.name);

					/* Calculate sum of nodes and show it under sectionName */
					var sectionValues = _.map(
						_.filter(that.nodes, function (_d) { /* Only get section nodes */
							return _d.sorts[that.currentSort] == d.value;
						}),
						function (_d) { /* Only get value */
							return _d.value;
						}
					);
					var sectionValue = _.reduce(sectionValues, function(memo, num){ return memo + num; }, 0);
					that.legendText.append('text')
						.attr('class', 'section-value')
						.attr('x', x)
						.attr('y', y + 20)
						.text(that.prefix._scale(sectionValue) +' '+ that.prefix.symbolText);

				});
			},
			/* Bubble chart bubbles */
			buildBubbles: function (data) {
				var that = this;
				data = data || this.nodes;

				this.bubbles = this.g.selectAll('._bubble')
					.data(data);

				/* Trouver nombre d'éléments et faire marcher exit */
				this.bubbles
					.enter()
						.append('svg:circle')
						.attr('class', '_bubble')
						.attr('cx', function (d, i) { return _.random(that.padding.left, that.innerWidth); })
						.attr('cy', function (d, i) { return _.random(that.padding.top, that.innerHeight); })
						.attr('r', function (d) { return d.radius; })

						/* MOVE TO CSS */
						.attr('fill', function (d) {
							return d.fillColor;
						})
						.attr('stroke', 'black')
						.attr('stroke-width', 1)
						.attr('opacity', 0.8)
						.on('mouseover', this.bubbleMouseover())
						.on('mouseout', this.bubbleMouseout())
						.moveToBack();

				this.bubbles
					.transition().duration(200)
					.attr('r', function (d) { return d.radius; })
					.attr('fill', function (d) { return d.fillColor; });

				this.bubbles
					.exit()
						.transition().duration(100)
							.attr('opacity', 0)
							.remove();
			},
			/* Bubble mouseover callback */
			bubbleMouseover: function () {
				var that = this;
				return function (d) {
					var bubble = this;

					/* Show tooltip */
					/*jshint multistr: true */
					that.$el.append('\
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
										<td>'+that.prefix._scale(d.value)+' '+that.prefix.symbolText+'</td>\
									</tr>\
								</tbody>\
							</table>\
						</div>\
					');
					var svg = that.$el.find('svg');
					d3.select(that.el).select('#nvtooltip-'+d._id)
						.style('left', function () {
							var xPos = d3.select(bubble).attr('cx');
							return xPos + 'px';
						})
						.style('top', function () {
							var yPos = d3.select(bubble).attr('cy');
							return yPos + 'px';
						})
						// .call(function () {
						// that.g.append('circle').attr('r', 3).attr('cy', d.y).attr('cx', d.x).attr('fill', 'red');
						// })
						.transition().duration(100)
							.style('opacity', 1);

					/* Add bubble style */
					d3.select(this)
						.attr('stroke-width', 3);
						
				};
			},
			/* Bubble mouseout callback */
			bubbleMouseout: function () {
				var that = this;
				return function (d) {
					d3.select(that.el).select('#nvtooltip-'+d._id)
						.transition().duration(100)
							.style('opacity', 0)
							.remove();

					d3.select(this)
						.attr('stroke-width', 1);
				};
			},
			/* Manage bubbles positions during they are moving, according to alpha arg which creates movement effect */
			updateBubblePositions: function (alpha) {
				var that = this;
				return function (d, i) {
					var targetX, targetY;
					/* If this bubble doesn't appear in this sort */
					if(_.isUndefined(d.sorts[that.currentSort])) {
						targetX = i % 2 ? - that.sectionWidth/2 : that.sectionWidth*1.5;
						targetY = -that.sectionHeight/2;
					} else {
						var sortIndex = _.findWhere(that.sortData[that.currentSort].children, {value: d.sorts[that.currentSort]}).index;
						targetX = (that.sectionWidth * (sortIndex % that.packByLine)) + that.quarterWidth;
						targetY = that.sectionHeight * (Math.floor(sortIndex / that.packByLine)) + that.sectionHeight/3;
					}
					d.y = d.y + (targetY - d.y) * alpha * 1.1 * that.defaultGravity;
					d.x = d.x + (targetX - d.x) * alpha * 1.1 * that.defaultGravity;
				};
				
			},
			collide: function(alpha) {
				var that = this,
					padding = 6,
					quadtree = d3.geom.quadtree(this.nodes);
				return function(d) {
				var r = d.radius + that.maxRadius + padding,
					nx1 = d.x - r,
					nx2 = d.x + r,
					ny1 = d.y - r,
					ny2 = d.y + r;
				quadtree.visit(function(quad, x1, y1, x2, y2) {
					if (quad.point && (quad.point !== d) && (d.group === quad.point.group)) {
						var x = d.x - quad.point.x,
							y = d.y - quad.point.y,
							l = Math.sqrt(x * x + y * y),
							r = d.radius + quad.point.radius;
						if (l < r) {
							l = (l - r) / l * alpha;
							d.x -= x *= l;
							d.y -= y *= l;
							quad.point.x += x;
							quad.point.y += y;
						}
					}
					return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
					});
				};
			},
			/* Set layout */
			start: function () {
				var that = this;

				this.force.nodes(this.nodes);
				this.force
					.gravity(this.gravity)
					.charge(this.charge)
					.friction(this.friction)
					.on('tick', function (e) {
						that.bubbles
							.each(that.updateBubblePositions(e.alpha))
							.each(that.collide(0.5))
							.attr("cx", function(d, i) { return d.x + that.padding.left; })
							.attr("cy", function(d) { return d.y + that.padding.top; });
					})
					.start();
			},
			/* Resize for example when bubble groups number changes */
			resize: function (args) {
				if(!_.isUndefined(args.height)) {
					this.g.transition().duration(400)
						.attr('height', args.height);
				}
				else if(!_.isUndefined(args.width)) {
					this.g.transition().duration(400)
						.attr('width', args.width);
				}
			}
		});

		return DistributionChartV;

});
