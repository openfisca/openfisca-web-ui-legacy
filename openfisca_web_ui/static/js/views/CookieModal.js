define(['bootstrap', 'jquery'], function(b, $) {

    var CookieModal = function () {};
    CookieModal.prototype = {
        init: function () {
            $("#cookie-modal").modal('show');

            $("input[name='accept-checkbox']").on('change', function() {
                var $button = $('.btn-accept-cookie');
                if (this.checked) {
                    $button.removeAttr('disabled');
                } else {
                    $button.attr('disabled', 'disabled');
                }
            });
        }
    };

    var cookieModal = new CookieModal();
    return cookieModal;

});
