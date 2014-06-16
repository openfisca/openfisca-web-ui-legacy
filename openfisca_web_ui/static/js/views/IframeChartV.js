'use strict';

var Backbone = require('backbone'),
  $ = require('jquery'),
  _ = require('underscore');

var chartsM = require('../models/chartsM'),
  visualizationsServiceM = require('../models/visualizationsServiceM');


var IframeChartV = Backbone.View.extend({
  initialize: function () {
    this.listenTo(chartsM, 'change:apiData', this.render);
  },
  render: function() {
    var visualizationData = _.find(visualizationsServiceM.get('visualizations'), function(item) {
      return item.slug === chartsM.get('currentChartSlug');
    });
    if ( ! _.isUndefined(visualizationData)) {
      this.$el.empty().append($('<iframe>', {
        'class': 'visualization-iframe',
        src: visualizationData.iframeSrcUrl + '&height=' + this.$el.height() + '&width=' + this.$el.width() +
          '&legislation_url=' + (chartsM.get('legislation') || '') + '&year=' + chartsM.get('year'),
      }));
    }
  },
});

module.exports = IframeChartV;
