'use strict';

var Backbone = require('backbone'),
  $ = require('jquery'),
  Q = require('q'),
  _ = require('underscore');

var appconfig = global.appconfig;


if (_.isUndefined(appconfig.enabledModules.charts)) {
  return;
}

var TestCasesServiceM = Backbone.Model.extend({
  defaults: {
    testCases: null
  },
  initialize: function() {
    this.fetch();
  },
  fetch: function() {
    return $.ajax({
      context: this,
      type: 'GET',
      url: appconfig.enabledModules.charts.urlPaths.testCasesSearch,
    })
    .done(function(data) {
      this.set('testCases', data);
    });
  },
});

var testCasesServiceM = new TestCasesServiceM();

module.exports = testCasesServiceM;
