require([
	'domReady',

	'app',
	'helpers'
], function(domReady, app, helpers) {

	$.noConflict();
//	_.noConflict();
//	Backbone.noConflict();
	// TODO call noConflict with other libs (d3)

	helpers.installPolyfills();
	app.init();

});
