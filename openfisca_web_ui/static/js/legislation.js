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
        $('.collapse-node-toggle.collapsed').each(function(index, el) {
            $(this).trigger('click');
        });
    });
    $('.btn-toggle-close').on('click', function(evt) {
        $('.collapse-node-toggle').each(function(index, el) {
            if (! $(this).hasClass('collapsed')) {
                $(this).trigger('click');
            }
        });
    });
});
