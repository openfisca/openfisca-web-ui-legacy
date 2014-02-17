require([
    'domReady',

    'app'
], function(domReady, app) {

    $.noConflict();
//    _.noConflict();
//    Backbone.noConflict();
    // TODO call noConflict with other libs (d3)

	var alertFallback = false;
	if (typeof console === "undefined" || typeof console.log === "undefined") {
		console = {};
		if (alertFallback) { console.log = function(msg) { alert(msg); }; }
		else { console.log = function() {}; }
	}

    app.init();

});
