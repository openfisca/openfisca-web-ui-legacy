require([
    'domReady',
    'jquery',
    'bootstrap',
], function(domReady, $, bootstrap) {

    $.noConflict();

    $('.collapse-node-toggle').on('click', function(evt) {
        evt.preventDefault();
    });

});
