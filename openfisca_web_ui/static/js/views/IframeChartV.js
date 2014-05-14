define([
	'backbone',
	'jquery',
	'underscore',

	'chartsM',
	'visualizationsServiceM',
], function (Backbone, $, _, chartsM, visualizationsServiceM) {
	'use strict';

	var IframeChartV = Backbone.View.extend({
		initialize: function () {
			this.listenTo(chartsM, 'change:apiData', this.render);
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
