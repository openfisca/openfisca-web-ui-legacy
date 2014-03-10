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
				'click .thumbnail-visualization': 'renderVisualization',
				'click button.back': 'render'
			},
			model: null,
			parent: null,
			initialize: function (options) {
				this.parent = options.parent;
				this.setElement(this.parent.el);
				this.model = new VisualizationsPaneM();
				this.listenTo(this.model, 'change:visualizations', this.render);
			},
			render: function() {
				this.$el
					.find('.visualization').remove().end()
					.append(visualizationsT({visualizations: this.model.get('visualizations')}));
			},
			renderVisualization: function(evt) {
				evt.preventDefault();
				var href = $(evt.target).parents('a').attr('href');
				var visualization = _.find(this.model.get('visualizations'), function(item) {
					return item.url === href;
				});
				this.$el.find('.row').replaceWith(visualizationT(visualization));
			},
			_remove: function () {
				this.$el.remove();
			}
		});

		return VisualizationsPaneV;

});
