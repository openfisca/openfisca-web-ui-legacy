define([
	'backbone',
	'jquery',
	'underscore',

	'chartM',
	'visualizationsServiceM',
	'hbs!templates/visualization',
	'hbs!templates/visualizations'
], function (Backbone, $, _, chartM, visualizationsServiceM, visualizationT, visualizationsT) {
	'use strict';

	var VisualizationsPaneV = Backbone.View.extend({
		events: {
			'click .thumbnail-link[target!="_blank"]': 'renderVisualization',
			'click button.back': 'render'
		},
		model: visualizationsServiceM,
		initialize: function () {
			this.listenTo(this.model, 'change:visualizations', this.render);
		},
		renderVisualization: function(evt) {
			evt.preventDefault();
			var href = $(evt.target).parents('a').attr('href');
			var visualization = _.find(this.model.get('visualizations'), function(item) {
				return item.sourceUrl === href;
			});
			this.$el.find('.row').replaceWith(visualizationT(visualization));
		},
		render: function() {
			this.$el
				.empty()
				.append(visualizationsT({visualizations: this.model.get('visualizations')}));
		}
	});

	return VisualizationsPaneV;
});
