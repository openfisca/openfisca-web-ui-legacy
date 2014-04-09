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
			legislation: null,
			year: null,
		},
		initialize: function () {
			this.listenTo(backendServiceM, 'change:formData', this.simulate);
		},
		simulate: function () {
			var options = {};
			var year = this.get('year');
			if (year !== null) {
				options.year = year;
			}
			if (this.get('currentChartSlug') === 'distribution') {
				options.decomposition = 'decompositions-multiples.xml';
			}
			var legislation = this.get('legislation');
			if (legislation !== null) {
				options.legislation = legislation;
			}
			return backendServiceM.simulate(options);
		}
	});

	var chartsM = new ChartsM();
	return chartsM;
});
