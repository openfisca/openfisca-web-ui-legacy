define([
    'jquery'
], function($) {

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
                        }
                    })
                    .done(function(data) {
                        window.location.href = data.accountUrl;
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        console.error('onlogin fail', jqXHR, textStatus, errorThrown, jqXHR.responseText);
                        navigator.id.logout();
                        // TODO translate string
                        alert("Login failure");
                    });
                },
                onlogout: function () {
                    if (window.location.pathname == '/logout') {
                        window.location.href = '/';
                    } else {
                        $.ajax({
                            type: 'POST',
                            url: '/logout'
                        })
                        .done(function() {
                            window.location.reload();
                        })
                        .fail(function(jqXHR, textStatus, errorThrown) {
                            console.error('onlogout fail', jqXHR, textStatus, errorThrown, jqXHR.responseText);
                            // TODO translate string
                            alert("Logout failure");
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
