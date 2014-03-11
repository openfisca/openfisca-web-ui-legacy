define([
	'jquery',
	'underscore',
	'backbone',
	'nvd3',

	'appconfig',
	'chartM',
	'helpers'
	],
	function ($, _, Backbone, nvd3, appconfig, chartM, helpers) {

		nvd3.dev = false;

		$('<link>', {
			href: appconfig.enabledModules.locatingChart.nvd3CssUrlPath,
			media: 'screen',
			rel: 'stylesheet'
		}).appendTo($('head'));

		var LocatingChartV = Backbone.View.extend({
			model: chartM,
//			TODO parametrize year
			year: 2011,
			padding: {
				top: 50,
				right: 0,
				bottom: 90,
				left: 50,
			},
			margin: {
				top: 0,
				left: 0,
				bottom: 0,
				right: 20
			},
			maxWidth: 1000,
			dataIsMissing: true,
			userPointFill: '#a63232',
			height: null,
			width: null,
			initialize: function () {
				var that = this;
				this.updateDimensions();
				this.vingtiles = _.map(this.model.get('vingtiles')['_'+this.year], function (d) { return $.extend(true, {}, d); });
				nvd3.addGraph({
					callback: function(chart) {
						if(that.model.fetched) {
							that.render();
						}
						that.listenTo(that.model, 'change:source', that.render);
					},
					generate: function() {
						that.chart = nvd3.models.lineChart()
							.margin({left: 100})
							.transitionDuration(300)
							.showLegend(true)
							.showYAxis(true)
							.showXAxis(true)
							.useInteractiveGuideline(true);

						that.svg = d3.select(that.el).append('svg')
							.attr('height', that.height)
							.attr('width', that.width)
							.datum(that.vingtiles)
							.call(that.chart);
				
						nvd3.utils.windowResize(function () {
							that.chart.update();
						});

						that.chart.interactiveLayer.tooltip
							.contentGenerator(that.tooltipContentGenerator.bind(that));

						that.svg.attr('opacity', 0);

						return that.chart;
					}
				});
			},
			render: function () {
				var that = this,
					data = this.model.get('locatingData');

				this.vingtiles = this.updateVingtilesByUserData(_.map(this.model.get('vingtiles')['_'+this.year], function (d) { return $.extend(true, {}, d); }), data);

				this.setPrefix();

				switch(this.yFormat.symbol) {
					case 'G': this.legendText = 'revenu en milliards €'; break;
					case 'M': this.legendText = 'revenu en millions €'; break;
					case 'k': this.legendText = 'revenu en milliers €'; break;
					case '': this.legendText = 'revenu en €'; break;
					default: this.legendText = '';
				}

				this.chart.xAxis
					.axisLabel('% de la population')
					.tickFormat(d3.format(',r'));

				this.chart.yAxis
					.axisLabel(this.legendText)
					.tickFormat(function (d) {
						return that.yFormat._scale(d);
					});

				that.svg.datum(this.vingtiles);
				that.svg.attr('opacity', 1);

				this.chart.update();

				if(!this.dataIsMissing) {
					if($('.nv-noData').length > 0) { $('.nv-noData').remove(); }
					this.showUserPoints();
				}
				else { this.showMissingDataError(); }

				$('.nv-legend').on('click', function () {
					that.showUserPoints();
				});
			},
			showUserPoints: function () {
				var that = this;
				_.each(this.vingtiles, function (d) {
					_.each(d.values, function (_d, _i) {
						if(_d.userPoint) {
							d3.select('.nv-series-'+d.values[0].series+' .nv-point-'+_i)
								.style('fill-opacity', 1)
								.style('stroke', that.userPointFill)
								.style('stroke-opacity', 1)
								.style('stroke-width', 4)
								.style('fill', that.userPointFill);
						}
						else {
							d3.select('.nv-series-'+d.values[0].series+' .nv-point-'+_i)
								.style('fill-opacity', 0)
								.style('stroke-opacity', 0);
						}
					});
				});
			},
			updateDimensions: function () {
				this.width = Math.min(this.$el.width(), this.maxWidth) - this.margin.left - this.margin.right;
				this.height = this.width * 0.66 - this.margin.bottom - this.margin.top;
			},
			updateVingtilesByUserData: function (vingtiles, data) {
				var r = {};
					r.revdisp = _.findDeep(data, {_id: 'revdisp'});
					r.sal = _.findDeep(data, {_id: 'sal'});
					r.pat = _.findDeep(data, {_id: 'pat'});

				r = _.filter(r, function (d) {
					return !_.isUndefined(d);
				});

				if(_.isEmpty(r)) {
					this.dataIsMissing = true;
					return vingtiles;
				}
				else {
					this.dataIsMissing = false;
				}

				vingtiles = _.filter(vingtiles, function (d) {
					return !_.isUndefined(_.findWhere(r, {'_id': d.id}));
				});
				
				/* Append user value to line */
				_.each(r, function (d) {
					var vingtile = _.findWhere(vingtiles, {'id': d._id});
					_.chain(vingtile.values)
						.push({
							userPoint: true,
							x: null,
							y: (d.values[0] < 0) ? 0 : d.values[0] /* Si le revenu disp < 0 (impossible!) */
						})
						.sort(function (a, b) { return a.y-b.y; })
						.each(function (d, i, el) {
							/* Define x position */
							if(d.userPoint) {
								if(i === 0) { d.x = 0; }
								else if(i == vingtile.values.length-1) { d.x = 99; }
								else {
									var dY = vingtile.values[i+1].y - vingtile.values[i-1].y,
										dy = d.y - vingtile.values[i-1].y,
										dX = vingtile.values[i+1].x - vingtile.values[i-1].x,
										dx = dX * dy / dY;

									d.x = d3.round(vingtile.values[i-1].x + dx);
								}
							}
					});
				});
				return vingtiles;
			},
			tooltipContentGenerator: function (d) {
				var that = this;
				if (_.isUndefined(this.yFormat)) return '';
				if (d === null) return '';
				var table = d3.select(document.createElement("table"));
				var theadEnter = table.selectAll("thead")
					.data([d])
					.enter().append("thead");
				theadEnter.append("tr")
					.append("td")
					.attr("colspan",3)
					.append("strong")
						.classed("x-value",true)
						.html(d.value+' % des français ont un');

				var tbodyEnter = table.selectAll("tbody")
					.data([d])
					.enter().append("tbody");
				var trowEnter = tbodyEnter.selectAll("tr")
					.data(function(p) { return p.series; })
					.enter()
					.append("tr")
					.classed("highlight", function(p) { return p.highlight; })
					;

				trowEnter.append("td")
					.classed("legend-color-guide",true)
					.append("div")
					.style("background-color", function(p) { return p.color; });
				trowEnter.append("td")
					.classed("key",true)
					.html(function (p) {
						return p.key + ' inférieur à : ';
					});
				trowEnter.append("td")
					.classed("value",true)
					.html(function(p,i) { return that.yFormat._scale(p.value) + ' '+ that.yFormat.symbolText; });

				trowEnter.selectAll("td").each(function(p) {
					if (p.highlight) {
						var opacityScale = d3.scale.linear().domain([0,1]).range(["#fff",p.color]);
						var opacity = 0.6;
						d3.select(this)
							.style("border-bottom-color", opacityScale(opacity))
							.style("border-top-color", opacityScale(opacity))
							;
					}
				});

				var html = table.node().outerHTML;
				if (d.footer !== undefined) {
					html += "<div class='footer'>" + d.footer + "</div>";
				}
				return html;
			},
			setPrefix: function () {
				var yMin = 0,
					yMax = d3.max(this.vingtiles, function (vingtile) { return d3.max(_.map(vingtile.values, function (d) { return d.y; })); }),
					magnitude = (Math.abs(yMin) > Math.abs(yMax)) ? Math.abs(yMin): Math.abs(yMax),
					that = this;

				this.yFormat = d3.formatPrefix(magnitude);
				/* Number formating */
				this.yFormat._scale = function (val) {
					if(	that.yFormat.symbol !== 'G' && that.yFormat.symbol !== 'M' && that.yFormat.symbol !== 'k' && that.yFormat.symbol !== '') {
						return (""+ d3.round(val, 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
					}
					var roundLevel = (that.yFormat.symbol == 'G' || that.yFormat.symbol == 'M') ? 2: 0;
					if(that.yFormat.symbol == 'k') val = that.yFormat.scale(val)*1000;
					else val = that.yFormat.scale(val);
					return (""+ d3.round(val, roundLevel)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
				};

				switch(this.yFormat.symbol) {
					case 'G': this.legendText = 'revenu en milliards €'; this.yFormat.symbolText = 'milliards €'; break;
					case 'M': this.legendText = 'revenu en millions €'; this.yFormat.symbolText = 'millions €'; break;
					case 'k': this.legendText = 'revenu en milliers €'; this.yFormat.symbolText = '€'; break;
					case '': this.legendText = 'revenu en €'; this.yFormat.symbolText = '€'; break;
					default: this.legendText = ''; this.yFormat.symbolText = '€';
				}
			},
			showMissingDataError: function () {
				if($('.nv-noData').length > 0) { $('.nv-noData').remove(); }
				
				d3.selectAll('.nv-point')
					.attr('style', null);


				var pos = {
					x: d3.round(this.width/2, 0),
					y: d3.round(this.height/2)
				};

				var nod = this.svg.append('svg:text')
					.attr('class', 'nv-noData')
					.attr('x', pos.x)
					.attr('y', pos.y)
					.style('text-anchor', 'middle')
					.text('Vos revenus ne vous permettent pas d\'apparaitre sur cette courbe');
			}
		});
		return LocatingChartV;
	}
);
