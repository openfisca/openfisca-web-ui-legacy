define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
],
function ($, _, Backbone, backendServiceM) {
	'use strict';

	var ChartsM = Backbone.Model.extend({
		defaults: {
			apiData: null,
			currentChartSlug: null,
		},
		initialize: function () {
			this.listenTo(backendServiceM, 'change:formData', this.simulate);
		},
		simulate: function () {
			var options = {};
			if(this.get('currentChartSlug') === 'distribution') {
				options.decomposition = 'decompositions-multiples.xml';
			}
			return backendServiceM.simulate(options);
		}
	});

	var chartsM = new ChartsM();
	return chartsM;
});
