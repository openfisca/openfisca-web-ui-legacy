define([
	'backbone',

	'backendServiceM',
	'chartM',
	'visualizationsServiceM',
	'hbs!templates/visualization',
], function (Backbone, backendServiceM, chartM, visualizationsServiceM, visualizationT) {
	'use strict';

	var IframeChartV = Backbone.View.extend({
		initialize: function () {
			this.listenTo(backendServiceM, 'change:apiData', this.render);
		},
		render: function() {
			this.$el.html(visualizationT(_.find(visualizationsServiceM.get('visualizations'), function(item) {
				return item.slug === chartM.get('currentChartSlug');
			})));
		},
	});

	return IframeChartV;
});
