define([
  'backbone',
  'jquery',
  'Q',
  'underscore',

  'appconfig',
],
function (Backbone, $, Q, _, appconfig) {
  'use strict';

  if ( ! ('situationForm' in appconfig.enabledModules)) {
    return;
  }

  var ChartsM = Backbone.Model.extend({
    defaults: {
      apiData: null,
      currentChartSlug: null,
      legislation: null,
      simulationStatus: null,
      year: appconfig.constants.defaultYear,
    },
    simulate: function(testCase) { this.simulateAsync(testCase).done(); },
    simulateAsync: function(testCase) {
      this.set('simulationStatus', 'in-progress');
      var data = {
        context: Date.now().toString(),
        scenarios: [
          {
            legislation_url: this.get('legislation'), // jshint ignore:line
            test_case: testCase, // jshint ignore:line
            year: this.get('year'),
          },
        ],
      };
      if (this.get('currentChartSlug') === 'distribution') {
        data.decomposition = 'decompositions-multiples.xml';
      }
      return Q($.ajax({
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'json',
        method: 'POST',
        url: appconfig.api.urls.simulate,
        xhrFields: {
          withCredentials: true,
        },
      }))
      .then(
        function(data) {
          this.set({
            apiData: data,
            simulationStatus: 'errors' in data ? 'error' : 'done',
          });
        }.bind(this),
        function() {
          this.set({apiData: null, simulationStatus: 'fail'});
        }.bind(this)
      );
    },
  });

  var chartsM = new ChartsM();
  return chartsM;
});
