require([
    'domReady',
    'jquery',

    'appconfig',
    'CookieModal'
], function(domReady, $, appconfig, CookieModal) {

    if (appconfig.cookieModal === true) {
      CookieModal.init();
    }


});
