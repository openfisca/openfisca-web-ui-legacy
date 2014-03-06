define([
	'backbone',
	'jquery',
	'underscore',

	'chartM',
	'VisualizationsPaneM',
	'hbs!templates/visualizations'
	], function (Backbone, $, _, chartM, VisualizationsPaneM, visualizationsT) {
		'use strict';

		var VisualizationsPaneV = Backbone.View.extend({
			model: null,
			parent: null,

			initialize: function (parent) {
				this.model = new VisualizationsPaneM();
				this.parent = parent;
				this.listenTo(this.model, 'change:visualizations', this.render);
			},
			render: function(data) {
				this.parent.$el.append(visualizationsT({visualizations: this.model.get('visualizations')}));
			},

			_remove: function () {
				this.$el.remove();
			}
		});

		return VisualizationsPaneV;

});
