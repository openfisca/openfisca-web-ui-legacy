define([
	'backbone',
	'jquery',
	'underscore',

	'backendServiceM',
	'chartsM',
	'visualizationsServiceM',
], function (Backbone, $, _, backendServiceM, chartsM, visualizationsServiceM) {
	'use strict';

	var IframeChartV = Backbone.View.extend({
		initialize: function () {
			this.listenTo(backendServiceM, 'change:apiData', this.render);
		},
		render: function() {
			var visualizationData = _.find(visualizationsServiceM.get('visualizations'), function(item) {
				return item.slug === chartsM.get('currentChartSlug');
			});
			this.$el.empty().append($('<iframe>', {'class': 'visualization-iframe', src: visualizationData.sourceUrl}));
		},
	});

	return IframeChartV;
});
