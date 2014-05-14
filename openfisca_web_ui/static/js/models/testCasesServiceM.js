define([
  'jquery',
  'Q',
  'underscore',
  'backbone',

  'appconfig'
],
function ($, Q, _, Backbone, appconfig) {
  'use strict';

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
    fetchCurrentTestCaseAsync: function() {
      return Q($.ajax({
        data: {context: Date.now().toString()},
        dataType: 'json',
        url: appconfig.enabledModules.situationForm.urlPaths.currentTestCase,
      }));
    },
  });

  var testCasesServiceM = new TestCasesServiceM();
  return testCasesServiceM;
});
