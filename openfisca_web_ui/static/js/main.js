require([
    'domReady',

    'app',
    'js/auth',
    'appconfig'
], function(domReady, app, auth, appconfig) {

    $.noConflict();
    _.noConflict();
    Backbone.noConflict();

    app.init();
    if (appconfig.auth.enable) {
        auth.init(appconfig.auth);
    }

});
