'use strict';

var Backbone = require('backbone'),
  _ = require('underscore');

var chartsM = require('./chartsM'),
  helpers = require('../helpers');

var vingtiles = require('../../data/vingtiles.json');


var LocatingChartM = Backbone.Model.extend({
  code: null,
  defaults: {
    data: null,
    vingtiles: null,
  },
  initialize: function(options) {
    this.code = options.code;
    this.set('vingtiles', _.findWhere(vingtiles, {id: this.code}));
    this.listenTo(chartsM, 'change:apiData', this.parseApiData);
  },
  parseApiData: function() {
    this.set('data',
      chartsM.get('simulationStatus') === 'done' ?
        helpers.findDeep(chartsM.get('apiData').value, {code: this.code}) :
        null
    );
  },
});

module.exports = LocatingChartM;
