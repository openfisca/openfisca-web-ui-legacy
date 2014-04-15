define([
	'jquery',
	'underscore',
	'backbone',

	'appconfig'
],
function ($, _, Backbone, appconfig) {
	'use strict';

	if (_.isUndefined(appconfig.enabledModules.charts)) {
		return;
	}

	var LegislationsServiceM = Backbone.Model.extend({
		defaults: {
			legislations: null
		},
		initialize: function() {
			this.fetch();
		},
		fetch: function() {
			return $.ajax({
				context: this,
				type: 'GET',
				url: appconfig.enabledModules.charts.urlPaths.legislationsSearch,
			})
			.done(function(data) {
				this.set('legislations', data);
			});
		}
	});

	var legislationsServiceM = new LegislationsServiceM();
	return legislationsServiceM;
});
