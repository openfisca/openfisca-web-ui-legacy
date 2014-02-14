require([
    'domReady',
    'jquery'
], function(domReady, $) {

    $("input[name='accept-checkbox']").on('change', function(evt) {
        if (this.checked) {
            $('.btn-accept-cookie').removeAttr('disabled');
        } else {
            $('.btn-accept-cookie').attr('disabled', 'disabled');
        }
    });

});
