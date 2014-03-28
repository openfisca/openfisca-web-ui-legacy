require([
	'domReady',
	'jquery',

	'app',
	'polyfills'
], function(domReady, $, app, polyfills) {
	'use strict';

	$.noConflict();
//	_.noConflict();
//	Backbone.noConflict();
	// TODO call noConflict with other libs (d3)

	polyfills.init();
	app.init();

});
