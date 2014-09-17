'use strict';

var $ = require('jquery'),
  Lazy = require('lazy.js'),
  request = require('superagent');

var helpers = require('./helpers'),
  models = require('./models');

var appconfig = global.appconfig;


function fetchCommunes(term, onComplete, onError) {
  var url = 'http://ou.comarquage.fr/api/v1/autocomplete-territory',
  data = {
    kind: ['CommuneOfFrance', 'ArrondissementOfCommuneOfFrance', 'AssociatedCommuneOfFrance'],
    term: term,
  };
  $.ajax({
    data: data,
    dataType: 'jsonp',
    jsonp: 'jsonp',
    traditional: true,
    url: url,
  })
  .done(function(data) {
    onComplete(data);
  })
  .fail(function(error) {
    onError(error);
  });
}

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
        onComplete({
          testCase: res.body.test_case, // jshint ignore:line
          testCaseAdditionalData: res.body.test_case_additional_data, // jshint ignore:line
        });
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
  newColumns.depcom.autocomplete = fetchCommunes;
  newColumns.depcom.label = 'Lieu de résidence';
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
          suggestions: suggestions,
          testCase: testCase,
        });
      }
    });
}

function saveCurrentTestCase(testCase, testCaseAdditionalData, onComplete) {
  request
    .post(appconfig.enabledModules.situationForm.urlPaths.currentTestCase)
    .send({
      test_case: testCase, // jshint ignore:line
      test_case_additional_data: testCaseAdditionalData, // jshint ignore:line
    })
    .on('error', function(error) {
      onComplete({error: error});
    })
    .end(function(res) {
      onComplete(res.error ? res : res.body);
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

module.exports = {fetchCurrentTestCase, fetchFields, repair, saveCurrentTestCase, simulate};
