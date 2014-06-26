'use strict';

var mapObject = require('map-object'),
  React = require('react/addons'),
  request = require('superagent');

var models = require('./models');

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

function patchColumns(columns) {
  // Patch columns definitions to match UI specificities.
  var birth = columns.birth;
  var spec = {
    birth: {
      '@type': {$set: 'Integer'},
      default: {$set: parseInt(birth.default.slice(0, 4))},
      label: {$set: 'Année de naissance'},
      max: {$set: new Date().getFullYear()},
      min: {$set: appconfig.constants.minYear},
      val_type: {$set: 'year'}, // jshint ignore:line
    },
  };
  var entitiesNameKeys = mapObject(models.entitiesMetadata, function(entity) { return entity.nameKey; });
  var requiredColumnNames = ['nom_individu'].concat(entitiesNameKeys);
  var requiredColumnNamesSpec = {};
  requiredColumnNames.map(function(requiredColumnName) {
    requiredColumnNamesSpec[requiredColumnName] = {required: {$set: true}};
  });
  spec = React.addons.update(spec, {$merge: requiredColumnNamesSpec});
  var newColumns = React.addons.update(columns, spec);
  return newColumns;
}

function patchValuesForColumns(data) {
  // Change values according to UI-specific columns.
  if (data.individus) {
    var spec = {individus: {}};
    mapObject(data.individus, function(individu, id) {
      if (individu.birth) {
        spec.individus[id] = {birth: {$set: parseInt(individu.birth.slice(0, 4))}};
      }
    });
    var newData = React.addons.update(data, spec);
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
          suggestions = res.body.suggestions.scenarios['0'].test_case; // jshint ignore:line
        suggestions = patchValuesForColumns(suggestions);
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

function simulate(legislationUrl, testCase, year, variables, onComplete) {
  var data = {
    scenarios: [
      {
        legislation_url: legislationUrl, // jshint ignore:line
        test_case: testCase, // jshint ignore:line
        year: year,
      },
    ],
    decomposition: variables || null,
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
