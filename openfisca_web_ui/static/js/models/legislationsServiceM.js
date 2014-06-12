'use strict';

var Backbone = require('backbone'),
  $ = require('jquery'),
  _ = require('underscore');

var appconfig = global.appconfig;


if (_.isUndefined(appconfig.enabledModules.charts)) {
  return;
}

var LegislationsServiceM = Backbone.Model.extend({
  defaults: {
    legislations: null
  },
  initialize: function() {
    this.fetch();
  },
  fetch: function() {
    return $.ajax({
      context: this,
      type: 'GET',
      url: appconfig.enabledModules.charts.urlPaths.legislationsSearch,
    })
    .done(function(data) {
      this.set('legislations', data);
    });
  }
});

var legislationsServiceM = new LegislationsServiceM();

module.exports = legislationsServiceM;
