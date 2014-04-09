define([
	'jquery',
	'underscore',
	'backbone',

	'appconfig'
],
function ($, _, Backbone, appconfig) {
	'use strict';

	var VisualizationsServiceM = Backbone.Model.extend({
		defaults: {
			visualizations: null
		},
		initialize: function() {
			this.fetch();
		},
		fetch: function() {
			return $.ajax({
				context: this,
				data: {
					enabled: true,
					iframe: true
				},
				type: 'GET',
				url: appconfig.enabledModules.charts.urlPaths.visualizationsSearch,
			})
			.done(function(data) {
				this.set('visualizations', data);
			});
		}
	});

	var visualizationsServiceM = new VisualizationsServiceM();
	return visualizationsServiceM;
});
