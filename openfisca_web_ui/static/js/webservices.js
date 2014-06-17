'use strict';

var request = require('superagent'),
  _ = require('underscore');

var appconfig = global.appconfig;


function fetchCurrentTestCase(onSuccess, onError) {
  request
    .get(appconfig.enabledModules.situationForm.urlPaths.currentTestCase)
    .end(function(res) {
      if (res.error) {
        onError(res.error);
      } else {
        onSuccess(res.body);
      }
    });
}

function repairTestCase(testCase, year, onSuccess, onError) {
  var data = {
    scenarios: [
      {
        test_case: testCaseForApi(testCase), // jshint ignore:line
        year: year,
      },
    ],
    validate: true,
  };
  request
    .post(appconfig.api.urls.simulate)
    .send(data)
    .end(function(res) {
      if (res.error) {
        onError(res.error);
      } else {
        var errors = null, // TODO
          testCase = res.body.repaired_scenarios[0].test_case, // jshint ignore:line
          suggestions = res.body.suggestions.scenarios['0'].test_case; // jshint ignore:line
        onSuccess({
          errors: errors,
          suggestions: suggestions,
          testCase: testCase,
        });
      }
    });
}

function simulate(legislationUrl, testCase, year, onSuccess, onError) {
  var data = {
    scenarios: [
      {
        legislation_url: legislationUrl, // jshint ignore:line
        test_case: testCaseForApi(testCase), // jshint ignore:line
        year: year,
      },
    ],
  };
  request
    .post(appconfig.api.urls.simulate)
    .send(data)
    .end(function(res) {
      if (res.error) {
        onError(res.error);
      } else {
        onSuccess(res.body.value);
      }
    });
}

function testCaseForApi(testCase) {
  // Returns a copy of testCase which is compliant with API input.
  var newValue = _.omit(testCase, 'individus'); // This is a copy.
  newValue.individus = _(testCase.individus)
    .chain()
    .map(function(individu, id) {
      return [id, _.omit(individu, 'id')];
    })
    .object()
    .value();
  return newValue;
}

module.exports = {
  fetchCurrentTestCase: fetchCurrentTestCase,
  repairTestCase: repairTestCase,
  simulate: simulate,
};
