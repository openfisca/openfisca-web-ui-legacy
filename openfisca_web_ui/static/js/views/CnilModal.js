define(['jquery'], function($) {

    var CnilModal = function () {};
    CnilModal.prototype = {
        init: function (cnilUrl) {
            var $form = $("#cnil-modal").find('form');
            $form.attr('action', cnilUrl);
            $("#cnil-modal").modal('show');
            $form.find("button[name='reject']").on('click', function() {
                navigator.id.logout();
            });
            $("input[name='accept-checkbox']").on('change', function() {
                var $button = $('.btn-accept-cnil');
                if (this.checked) {
                    $button.removeAttr('disabled');
                } else {
                    $button.attr('disabled', 'disabled');
                }
            });
        }
    };

    var cnilModal = new CnilModal();
    return cnilModal;

});
