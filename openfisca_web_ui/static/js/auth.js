define(['jquery'], function($) {

    var Auth = function () {};
    Auth.prototype = {
        init: function (authconfig) {
            navigator.id.watch({
                loggedInUser: authconfig.currentUser,
                onlogin: function (assertion) {
                    $.ajax({
                        type: 'POST',
                        url: '/login',
                        data: {
                            assertion: assertion
                        },
                        success: function(res, status, xhr) {
                            if (!res.existingAccount) {
                                $form = $("#cnil-modal").find('form');
                                $form.attr('action', res.cnilUrl);
                                $("#cnil-modal").modal('show');
                                $form.find("button[name='reject']").on('click', function() {
                                    navigator.id.logout();
                                });
                            } else {
                                window.location = res.accountUrl;
                            }
                        },
                        error: function(xhr, status, err) {
                            navigator.id.logout();
                            // TODO translate string
                            alert("Login failure: " + err);
                        }
                    });
                },
                onlogout: function () {
                    if (window.location.pathname == '/logout') {
                        window.location.href = '/';
                    } else {
                        $.ajax({
                            type: 'POST',
                            url: '/logout',
                            success: function(res, status, xhr) {
                                window.location.reload();
                            },
                            error: function(xhr, status, err) {
                                // TODO translate string
                                alert("Logout failure: " + err);
                            }
                        });
                    }
                }
            });

            $('.sign-in').on('click', function() {
                navigator.id.request();
            });

            $('.sign-out').on('click', function() {
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

    var auth = new Auth();
    return auth;

});
