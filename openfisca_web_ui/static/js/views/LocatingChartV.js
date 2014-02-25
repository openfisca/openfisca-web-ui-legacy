define([
	'chartM',
	'helpers',
	'nvd3',

	'jquery',
	'underscore',
	'backbone'
	],
	function (chartM, helpers, nvd3, $, _, Backbone) {
		
		var LocatingChartV = Backbone.View.extend({
			model: chartM,

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
			initialize: function (parent) {

				var that = this;
				this.active = true;

				/* Add nvd3 stylesheet */
				if($('link[href$="/bower/nvd3/nv.d3.min.css"').length == 0) {
					$('<link>').appendTo('head').attr({type : 'text/css', rel : 'stylesheet'}).attr('href', '/bower/nvd3/nv.d3.min.css');
				}

				this.height = parent.height - this.margin.bottom - this.margin.top;
				this.width = parent.width - this.margin.left - this.margin.right;

				this.vingtiles = _.map(this.model.get('vingtiles')['_'+this.year], function (d) { return $.extend(true, {}, d); });

				nv.addGraph(function() {

					that.chart = nv.models.lineChart()
						.margin({left: 100})
						.transitionDuration(300)
						.showLegend(true)
						.showYAxis(true)
						.showXAxis(true)
						.useInteractiveGuideline(true);

					d3.select('svg')
						.datum(that.vingtiles)
						.call(that.chart);
				
					nv.utils.windowResize(function() {
						if(that.active) that.chart.update();
					});

					that.chart.interactiveLayer.tooltip
					    .contentGenerator(that.tooltipContentGenerator.bind(that));

					d3.select('svg').attr('opacity', 0);
					that.setElement('.nvd3');

					if(that.model.fetched) that.render();
					that.listenTo(that.model, 'change:source', that.render);

					return that.chart;
				});
			},
			render: function () {
				var that = this,
					data = this.model.get('locatingData');

				this.vingtiles = this.updateVingtilesByUserData(_.map(this.model.get('vingtiles')['_'+this.year], function (d) { return $.extend(true, {}, d); }), data);

				var yMin = 0,
					yMax = d3.max(this.vingtiles, function (vingtile) { return d3.max(_.map(vingtile.values, function (d) { return d.y; })); });
				this.yFormat = d3.formatPrefix(yMax);

				switch(this.yFormat.symbol) {
					case 'G': this.legendText = 'revenu en milliards €'; break;
					case 'M': this.legendText = 'revenu en millions €'; break;
					case 'k': this.legendText = 'revenu en milliers €'; break;
					case '': this.legendText = 'revenu en €'; break;
					default: this.legendText = '';
				};

				this.chart.xAxis
					.axisLabel('% de la population')
					.tickFormat(d3.format(',r'));

				this.chart.yAxis
					.axisLabel(this.legendText)
					.tickFormat(function (d) {
				        return that.yFormat.scale(d); 
				});

				d3.select('svg').datum(this.vingtiles);
				d3.select('svg').attr('opacity', 1);

				this.chart.update();

				this.showUserPoints();

				$('.nv-legend').on('click', function () {
					if(this.active) that.showUserPoints();
				});
			},
			showUserPoints: function () {
				_.each(this.vingtiles, function (d) {
					_.each(d.values, function (_d, _i) {
						if(_d.userPoint) {
							d3.select('.nv-series-'+d.values[0].series+' .nv-point-'+_i)
								.style('fill-opacity', 1)
								.style('stroke-opacity', 1);
						}
						else {
							d3.select('.nv-series-'+d.values[0].series+' .nv-point-'+_i)
								.style('fill-opacity', 0)
								.style('stroke-opacity', 0);
						}
					});
				});
			},
			updateVingtilesByUserData: function (vingtiles, data) {
				var r = {};
					r.revdisp = _.findDeep(data, {_id: 'revdisp'}),
					r.sal = _.findDeep(data, {_id: 'sal'}),
					r.pat = _.findDeep(data, {_id: 'pat'});

				r = _.filter(r, function (d) {
					return !_.isUndefined(d);
				});

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
								if(i == 0) { d.x = 0; }
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
				if (d == null) return '';
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
					.data(function(p) { return p.series})
					.enter()
					.append("tr")
					.classed("highlight", function(p) { return p.highlight})
					;

				trowEnter.append("td")
					.classed("legend-color-guide",true)
					.append("div")
						.style("background-color", function(p) { return p.color});
				trowEnter.append("td")
					.classed("key",true)
					.html(function(p) {return p.key + ' inférieur à : '});
				trowEnter.append("td")
					.classed("value",true)
					.html(function(p,i) { return (""+p.value).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' euros'; });

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
	            if (d.footer !== undefined)
	                html += "<div class='footer'>" + d.footer + "</div>";
	            return html;
			},
			_remove: function () {
				d3.select('svg')
	              .on('mousemove', null)
	              .on("mouseout" ,null)
	              .on("dblclick" ,null);
				
				this.stopListening(this.model);
				this.active = false;
			}
		});
		return LocatingChartV;
	}
);
