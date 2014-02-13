define([
	'DetailChartM',
	'WaterfallChart',
	'd3',

	'jquery',
	'underscore',
	'backbone'
	],
	function (DetailChartM, WaterfallChart, d3) {

		var DetailChartV = Backbone.View.extend({
			events: {},

			/* Settings */
			model: new DetailChartM,
			views: [],
			datakey: 'groupedDatas.all',

			/* Properties */
			width: 980,
			height: 500,

			bubbles: [],
			d_bubbles: undefined,

			initialize: function () {
				console.info('DetailChartV initialized');

				d3.select(this.el).append('svg')
					.attr('width', this.width)
					.attr('height', this.height)
					.attr('id', 'detail-chart');

				this.setElement(this.$el.find('#detail-chart'));

				this.views.push(
					new WaterfallChart({
						title: 'Waterfall Chart',
						parent: this,
						datakey: 'groupedDatas.all'
					})
				);

				this.listenTo(this.model, 'change:datas', this.render);
			},
			// createBubbles: function () {
			// 	var that = this;
			// 	this.d_bubbles = d3.select(this.el)
			// 		.selectAll('circle')
			// 		.data(this.model.get(this.datakey))
			// 		.enter().append('svg:circle')
			// 		.attr('color', function (d) { return '#000000'; })
			// 		.attr('r', function (d) { return 10; })
			// 		.call(function (d) {
			// 			that.bubbles.push(d[0]);
			// 		})
			// 		.attr('fill', function (d) {
			// 			if(d.isPositive == true) return '#AA7858';
			// 			else return '#AAAAAA';
			// 		})
			// 		.attr('r', function (d) {
			// 			return Math.sqrt(Math.abs(d.value))/2;
			// 		});	
			// },
			render: function () {
				console.log(this.model.get('datas'));

				return this;
			}
		});
		return DetailChartV;
	}
);