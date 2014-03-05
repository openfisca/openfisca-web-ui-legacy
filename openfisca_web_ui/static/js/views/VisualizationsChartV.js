define([
	'jquery',
	'backbone',
	'chartM',
	'hbs!templates/visualizations'
	], function ($, Backbone, chartM, visualizationsT) {
		'use strict';

		var VisualizationsChartV = Backbone.View.extend({
			model: chartM,

			initialize: function (parent) {
				$.ajax({
					type: 'GET',
					url: '/api/1/visualizations/search',
					success: function(data) {
						var visualizationsHtml = $('<div>').html(visualizationsT({visualizations: data}));
						parent.$el.append($('<div>').html(visualizationsHtml));
					}
				});
			},
			_remove: function () {
				this.$el.remove();
			}
		});

		return VisualizationsChartV;

});
