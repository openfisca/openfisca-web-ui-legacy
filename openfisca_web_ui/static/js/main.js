require([
	'jquery',

	'app',
	'polyfills'
], function($, app, polyfills) {
	'use strict';

	$.noConflict();
//	_.noConflict();
//	Backbone.noConflict();
	// TODO call noConflict with other libs (d3)

	polyfills.init();

	app.init();
});
