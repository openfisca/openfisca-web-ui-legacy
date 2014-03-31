define([
	'backbone',
	'jquery',
	'underscore',

	'chartM',
	'visualizationsServiceM',
	'hbs!templates/visualization',
], function (Backbone, $, _, chartM, visualizationsServiceM, visualizationT) {
	'use strict';

	var IframeChartV = Backbone.View.extend({
		model: visualizationsServiceM,
		initialize: function () {
			this.listenTo(this.model, 'change:visualizations', this.render);
		},
		render: function(chartSlug) {
			this.$el.html(visualizationT(_.find(this.model.get('visualizations'), function(item) {
				return item.slug === chartSlug;
			})));
		},
	});

	return IframeChartV;
});
