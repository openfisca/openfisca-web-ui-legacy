'use strict';

var request = require('superagent');

var appconfig = global.appconfig;


function fetchCurrentTestCase(onComplete) {
  request
    .get(appconfig.enabledModules.situationForm.urlPaths.currentTestCase)
    .on('error', function(error) {
      onComplete({error: error.message});
    })
    .end(function(res) {
      if (res.body && res.body.error) {
        onComplete(res.body);
      } else if (res.error) {
        onComplete(res);
      } else {
        onComplete(res.body);
      }
    });
}

function fetchFields(onComplete) {
  request
    .get(appconfig.api.urls.fields)
    .on('error', function(error) {
      onComplete({error: error.message});
    })
    .end(function(res) {
      if (res.body && res.body.error) {
        onComplete(res.body);
      } else if (res.error) {
        onComplete(res);
      } else if (res.body && 'columns' in res.body && 'columns_tree' in res.body) {
        onComplete(res.body);
      } else {
        onComplete({error: 'invalid fields data: no columns or no columns_tree'});
      }
    });
}

function fetchLegislations(onComplete) {
  request
    .get(appconfig.enabledModules.charts.urlPaths.legislationsSearch)
    .on('error', function(error) {
      onComplete({error: error.message});
    })
    .end(function(res) {
      if (res.body && res.body.error) {
        onComplete(res.body);
      } else if (res.error) {
        onComplete(res);
      } else {
        onComplete(res.body);
      }
    });
}

function fetchVisualizations(onComplete) {
  request
    .get(appconfig.enabledModules.charts.urlPaths.visualizationsSearch)
    .on('error', function(error) {
      onComplete({error: error.message});
    })
    .end(function(res) {
      if (res.body && res.body.error) {
        onComplete(res.body);
      } else if (res.error) {
        onComplete(res);
      } else {
        onComplete(res.body);
      }
    });
}

function repair(testCase, year, onComplete) {
  var data = {
    scenarios: [
      {
        test_case: testCase, // jshint ignore:line
        year: year,
      },
    ],
    validate: true,
  };
  request
    .post(appconfig.api.urls.simulate)
    .send(data)
    .on('error', function(error) {
      onComplete({error: error.message});
    })
    .end(function(res) {
      if (res.body && res.body.error) {
        onComplete({
          errors: res.body.error.errors[0].scenarios['0'].test_case, // jshint ignore:line
          originalTestCase: res.body.params.scenarios[0].test_case, // jshint ignore:line
          suggestions: null,
        });
      } else if (res.error) {
        onComplete(res);
      } else {
        var testCase = res.body.repaired_scenarios[0].test_case, // jshint ignore:line
          suggestions = res.body.suggestions.scenarios['0'].test_case; // jshint ignore:line
        onComplete({
          errors: null,
          originalTestCase: res.body.params.scenarios[0].test_case, // jshint ignore:line
          suggestions: suggestions,
          testCase: testCase,
        });
      }
    });
}

function saveCurrentTestCase(testCase, onComplete) {
  var data = {test_case: testCase}; // jshint ignore:line
  request
    .post(appconfig.enabledModules.situationForm.urlPaths.currentTestCase)
    .send(data)
    .on('error', function(error) {
      onComplete({error: error.message});
    })
    .end(function(res) {
      if (res.error) {
        onComplete(res);
      } else {
        onComplete(res.body);
      }
    });
}

function simulate(legislationUrl, testCase, year, onComplete) {
  var data = {
    scenarios: [
      {
        legislation_url: legislationUrl, // jshint ignore:line
        test_case: testCase, // jshint ignore:line
        year: year,
      },
    ],
  };
  request
    .post(appconfig.api.urls.simulate)
    .send(data)
    .on('error', function(error) {
      onComplete({error: error.message});
    })
    .end(function(res) {
      if (res.body && res.body.error) {
        onComplete({
          errors: res.body.error.errors[0].scenarios['0'].test_case, // jshint ignore:line
        });
      } else if (res.error) {
        onComplete(res);
      } else {
        onComplete(res.body.value);
      }
    });
}

module.exports = {
  fetchCurrentTestCase: fetchCurrentTestCase,
  fetchFields: fetchFields,
  fetchLegislations: fetchLegislations,
  fetchVisualizations: fetchVisualizations,
  repair: repair,
  saveCurrentTestCase: saveCurrentTestCase,
  simulate: simulate,
};
