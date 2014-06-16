'use strict';

var Backbone = require('backbone');


var AcceptCookiesModalV = Backbone.View.extend({
  el: '#accept-cookies-modal',
  events: {
    'change input[name="accept-checkbox"]': 'updateAcceptButton'
  },
  initialize: function () {
    this.$el.modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    });
    this.updateAcceptButton();
  },
  updateAcceptButton: function() {
    var $button = this.$el.find('button[name="accept"]');
    if (this.$el.find('input[name="accept-checkbox"]').is(':checked')) {
      $button.removeAttr('disabled');
    } else {
      $button.attr('disabled', 'disabled');
    }
  }
});

module.exports = AcceptCookiesModalV;
