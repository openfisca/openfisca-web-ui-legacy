define([
	'backbone',
	'jquery',
	'underscore',

	'chartM',
	'VisualizationsPaneM',
	'hbs!templates/visualization',
	'hbs!templates/visualizations'
	], function (Backbone, $, _, chartM, VisualizationsPaneM, visualizationT, visualizationsT) {
		'use strict';

		var VisualizationsPaneV = Backbone.View.extend({
			events: {
				'click .thumbnail-link[target!="_blank"]': 'renderVisualization',
				'click button.back': 'renderVisualizations'
			},
			model: null,
			initialize: function () {
				this.model = new VisualizationsPaneM();
				this.listenTo(this.model, 'change:visualizations', this.renderVisualizations);
			},
			renderVisualization: function(evt) {
				evt.preventDefault();
				var href = $(evt.target).parents('a').attr('href');
				var visualization = _.find(this.model.get('visualizations'), function(item) {
					return item.sourceUrl === href;
				});
				this.$el.find('.row').replaceWith(visualizationT(visualization));
			},
			renderVisualizations: function() {
				this.$el
					.empty()
					.append(visualizationsT({visualizations: this.model.get('visualizations')}));
			}
		});

		return VisualizationsPaneV;

});
