'use strict';

var Backbone = require('backbone'),
  $ = require('jquery'),
  _ = require('underscore');

var appconfig = global.appconfig;


if (_.isUndefined(appconfig.enabledModules.charts)) {
  return;
}

var VisualizationsServiceM = Backbone.Model.extend({
  defaults: {
    visualizations: null
  },
  initialize: function() {
    this.fetch();
  },
  fetch: function() {
    return $.ajax({
      context: this,
      data: {enabled: true},
      type: 'GET',
      url: appconfig.enabledModules.charts.urlPaths.visualizationsSearch,
    })
    .done(function(data) {
      this.set('visualizations', data);
    });
  }
});

var visualizationsServiceM = new VisualizationsServiceM();

module.exports = visualizationsServiceM;
