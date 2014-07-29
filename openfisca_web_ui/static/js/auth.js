'use strict';

var $ = require('jquery'),
  invariant = require('react/lib/invariant');


function init(options) {
  function handleLogout() {
    if (window.location.pathname == options.logoutUrlPath) {
      window.location.href = '/';
    } else {
      $.ajax({
        type: 'POST',
        url: options.logoutUrlPath,
      })
      .done(function() {
        if (typeof options.redirectLocation === 'undefined') {
          window.location.reload();
        } else {
          window.location.href = options.redirectLocation;
        }
      })
      .fail(function(/*jqXHR, textStatus, errorThrown*/) {
        console.error('logout error');
      });
    }
  }
  invariant(navigator.id, 'navigator.id is not defined');
  if (options.isDummy) {
    $(document).on('click', '.sign-out', function(event) {
      event.preventDefault();
      handleLogout();
    });
  } else {
    navigator.id.watch({
      loggedInUser: options.currentUser,
      onlogin: function(assertion) {
        $.ajax({
          type: 'POST',
          url: '/login',
          data: {assertion: assertion}
        })
        .done(function() {
          window.location.reload();
        })
        .fail(function(/*jqXHR, textStatus, errorThrown*/) {
          navigator.id.logout();
          console.error('authentication error');
        });
      },
      onlogout: handleLogout,
    });
    if (options.logout) {
      navigator.id.logout();
    } else {
      $(document).on('click', '.sign-in', function(event) {
        event.preventDefault();
        navigator.id.request();
      });
      $(document).on('click', '.sign-out', function(event) {
        event.preventDefault();
        navigator.id.logout();
      });
  }
  }
}

module.exports = {init: init};
