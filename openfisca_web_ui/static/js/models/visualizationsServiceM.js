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
		initialize: function () {
			this.fetch();
		},
		fetch: function() {
			$.ajax({
				context: this,
				data: {
					enabled: true,
					iframe: true
				},
				type: 'GET',
				url: appconfig.enabledModules.visualizations.searchUrlPath,
			})
			.done(function(data) {
				this.set('visualizations', data);
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				console.error('Fetch fail', jqXHR, textStatus, errorThrown);
			});
		}
	});

	var visualizationsServiceM = new VisualizationsServiceM();
	return visualizationsServiceM;
});
