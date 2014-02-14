require([
    'domReady',

    'app'
], function(domReady, app) {

    $.noConflict();
//    _.noConflict();
//    Backbone.noConflict();
    // TODO call noConflict with other libs (d3)

    app.init();

});
