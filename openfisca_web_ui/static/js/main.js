require([
	'domReady',
	'jquery',

	'app',
	'helpers'
], function(domReady, $, app, helpers) {
	'use strict';

	$.noConflict();
//	_.noConflict();
//	Backbone.noConflict();
	// TODO call noConflict with other libs (d3)

	helpers.installPolyfills();
	app.init();

});
