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
			sectionWidth: null,
			sectionHeight: null,
			sectionBottomMargin: 30,

			defaultPackByLine: 3,
			packByLine: null,

			/* D3 Settings */
			force: d3.layout.force(),
			gravity: 0,
			charge: function (d) { return -Math.pow(d.radius, 2.0)/1.2; },
			friction: 0.6,
			rScale: d3.scale.linear().clamp(true),
			defaultGravity: 0.4,

			nodes: [],
			bubbles: {},
			positiveColor: '#6aa632',
			negativeColor: '#b22424',

			prefix: null,

			/* Sort */
			sortData: {
				'positive': {
					'name': 'Cotisations / prestations',
					'children': [
						{ name: 'Cotisations', value: false },
						{ name: 'Prestations', value: true }
					]
				},
				'test': {
					'name': 'Test',
					'children': [
						{ name: 'valeur 1', value: 'aaa' },
						{ name: 'valeur 2', value: 'bbb' },
						{ name: 'valeur 4', value: 'ddd' },
						{ name: 'valeur 5', value: 'eee' },
						{ name: 'valeur 6', value: 'fff' },
						{ name: 'valeur 3', value: 'ccc' },
						{ name: 'valeur 7', value: 'ggg' },
						{ name: 'valeur 8', value: 'hhh' },
						{ name: 'valeur 9', value: 'iii' },
						{ name: 'valeur 10', value: 'jjj' }
					]
				}
			},

			initialize: function (options) {
				this.updateDimensions();

				this.innerWidth = this.width - this.padding.left - this.padding.right;
				this.innerHeight = this.height - this.padding.top - this.padding.bottom;

				this.$el.append('<div id="sort-menu" class="btn-group"></div>');

				this.g = d3.select(this.el).append('svg')
					.attr('height', this.height)
					.attr('width', this.width);

				this.legendText = this.g.append('g')
					.attr('class', 'text-label');

				this.currentSort = this.defaultSort;

				/* Render when data if ok or is changed */
				if(this.model.fetched) this.render();
				this.listenTo(this.model, 'change:source', this.render);
			},
			render: function (sortType) {
				if(typeof sortType != 'string') sortType = this.currentSort;

				// /* If data.length < packByLine */
				if(this.sortData[sortType].children.length < this.defaultPackByLine) this.packByLine = this.sortData[sortType].children.length;
				else this.packByLine = this.defaultPackByLine;

				var data = this.model.get('distributionData', {type: sortType});

				this.setSectionsDimensions();
				this.setPrefix(data);

				this.sortBubblesBy(sortType, data);
				this.setHeader(sortType);
			},
			setSectionsDimensions: function () {
				this.sectionWidth = this.innerWidth / (this.packByLine);
				this.quarterWidth = this.sectionWidth / 2;
				this.sectionHeight = this.sectionWidth + this.sectionBottomMargin;
				this.rScale.range([2, this.sectionWidth/4]);
			},
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
					case 'G': this.prefix.symbolText = 'milliards\n€';
						break;
					case 'M': this.prefix.symbolText = 'millions\n€';
						break;
					case 'k': this.prefix.symbolText = '€';
						break;
					case '': this.prefix.symbolText = '€';
						break;
					default:
						this.legendText = '';
				}
			},
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
			sortBubblesBy: function (sortType, data) {
				this.currentSort = sortType;
				this.rScale.domain([0, d3.max(data, function (d) { return Math.abs(d.value); })]);
				this.updateNodes(data);

				/* Add index to sort data values */
				_.each(this.sortData[sortType].children, function (d, i) { d.index = i; });

				this.buildBubbles(this.nodes);

				this.buildTextLegend();

				this.resize({'height': Math.ceil(this.sortData[sortType].children.length / this.packByLine)*this.sectionWidth + this.padding.top + this.padding.bottom});

				this.start();
			},
			updateDimensions: function() {
				this.width = Math.min(this.$el.width(), this.maxWidth);
				this.height = this.width * 0.66;
			},
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
					if(!_.isUndefined(node.sort)) out.sort = node.sort;

					return out;
				});
				this.nodes = outputNodes;
			},
			buildTextLegend: function () {
				var that = this;
				this.$el.find('.text-label').html('');
				_.each(this.sortData[this.currentSort].children, function (d, i) {
					var x = (that.sectionWidth * (i % that.packByLine)) + that.quarterWidth,
						y = that.sectionHeight * (Math.floor(i / that.packByLine)) + that.sectionHeight;

					that.legendText.append('text')
						.attr('class', 'title')
						.attr('x', x)
						.attr('y', y)
						.text(d.name);
				});
			},
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
			updateBubblePositions: function (alpha) {
				var that = this;
				return function (d, i) {
					var sortIndex = _.findWhere(that.sortData[that.currentSort].children, {value: d.sort}).index,
						targetX = (that.sectionWidth * (sortIndex % that.packByLine)) + that.quarterWidth,
						targetY = that.sectionHeight * (Math.floor(sortIndex / that.packByLine)) + that.quarterWidth;

					d.y = d.y + (targetY - d.y) * alpha * 1.1 * that.defaultGravity;
					d.x = d.x + (targetX - d.x) * alpha * 1.1 * that.defaultGravity;
				};
				
			},
			/* Layouts */
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
							.attr("cx", function(d, i) { return d.x + that.padding.left; })
							.attr("cy", function(d) { return d.y + that.padding.top; });
					})
					.start();
			},
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
