'use strict';

var Lazy = require('lazy.js'),
  request = require('superagent');

var helpers = require('./helpers'),
  models = require('./models');

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
        var data = {
          columns: patchColumns(res.body.columns),
          columnsTree: res.body.columns_tree, // jshint ignore:line
        };
        onComplete(data);
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

function patchColumns(columns) {
  // Patch columns definitions to match UI specificities.
  var birth = columns.birth;
  var newColumns = {
    birth: {
      '@type': 'Integer',
      default: parseInt(birth.default.slice(0, 4)),
      label: 'Année de naissance',
      max: new Date().getFullYear(),
      min: appconfig.constants.minYear,
      val_type: 'year', // jshint ignore:line
    },
  };
  var entitiesNameKeys = Lazy(models.entitiesMetadata).pluck('nameKey').toArray();
  var requiredColumnNames = ['nom_individu'].concat(entitiesNameKeys);
  var requiredColumns = Lazy(requiredColumnNames).map(function(requiredColumnName) {
    return [requiredColumnName, {required: true}];
  }).toObject();
  newColumns = Lazy(columns).merge(newColumns).merge(requiredColumns).toObject();
  return newColumns;
}

function patchValuesForColumns(data) {
  // Change values according to UI-specific columns.
  if (data.individus) {
    var newIndividus = Lazy(data.individus).map(function(individu, id) {
      return [
        id,
        individu.birth ?
          Lazy(individu).assign({birth: parseInt(individu.birth.slice(0, 4))}).toObject() :
          individu
      ];
    }).toObject();
    var newData = Lazy(data).assign({individus: newIndividus}).toObject();
    return newData;
  } else {
    return data;
  }
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
          suggestions = helpers.getObjectPath(res.body, 'suggestions', 'scenarios', '0', 'test_case');
        if (suggestions) {
          suggestions = patchValuesForColumns(suggestions);
        }
        testCase = patchValuesForColumns(testCase);
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

function simulate(axes, decomposition, legislationUrl, testCase, year, onComplete) {
  var scenario = {
    legislation_url: legislationUrl, // jshint ignore:line
    test_case: testCase, // jshint ignore:line
    year: year,
  };
  if (axes) {
    scenario.axes = axes;
  }
  var data = {scenarios: [scenario]};
  if (decomposition) {
    data.decomposition = decomposition;
  }
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
  repair: repair,
  saveCurrentTestCase: saveCurrentTestCase,
  simulate: simulate,
};
