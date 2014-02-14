define([
    'jquery',

    'CnilModal'
], function($, CnilModal) {

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
                                CnilModal.init(res.cnilUrl);
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

            $(document).on('click', '.sign-in', function () {
                navigator.id.request();
            });

            $(document).on('click', '.sign-out', function() {
                navigator.id.logout();
            });
        }
    };

    var auth = new Auth();
    return auth;

});
