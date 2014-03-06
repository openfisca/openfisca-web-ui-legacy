define([
	'jquery',
	'underscore',
	'backbone',
	'appconfig'
	],
	function ($, _, Backbone, appconfig) {

		var VisualizationsPaneM = Backbone.Model.extend({
			defaults: {
				visualizations: null
			},

			initialize: function () {
				this.fetch();
			},
			fetch: function() {
				$.ajax({
					type: 'GET',
					url: appconfig.enabledModules.visualizations.searchUrlPath,
				})
				.done(_.bind(function(data) {
					this.set('visualizations', data);
				}, this))
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('Fetch fail', jqXHR, textStatus, errorThrown);
				});
			}
		});

		return VisualizationsPaneM;

	}
);
