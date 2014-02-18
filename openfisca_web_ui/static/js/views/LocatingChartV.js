define([
	'LocatingChartM',

	'jquery',
	'underscore',
	'backbone'
	],
	function (LocatingChartM) {
		var LocatingChartV = Backbone.View.extend({
			events: {},
			model: new LocatingChartM,
			
			initialize: function () {
			},
			render: function () {

				return this;
			}
		});
		return LocatingChartV;
	}
);
