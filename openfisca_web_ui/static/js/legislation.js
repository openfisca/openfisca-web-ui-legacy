require([
    'domReady',
    'jquery',
    'bootstrap',
], function(domReady, $, bootstrap) {

    $.noConflict();

    $('.collapse-node-toggle').on('click', function(evt) {
        evt.preventDefault();
    });

    $('.btn-toggle-open').on('click', function(evt) {
        $('.collapse-node').collapse('show');
    });

    $('.btn-toggle-close').on('click', function(evt) {
        $('.collapse-node').collapse('hide');
    });
});
