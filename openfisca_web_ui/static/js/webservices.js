'use strict';

var $ = require('jquery'),
  Lazy = require('lazy.js'),
  request = require('superagent');

var helpers = require('./helpers');


var appconfig = global.appconfig;
var calculateResultByDataCache = {};
var simulateResultByDataCache = {};


// Utils

function makeUrl(path) {
  var baseUrl = appconfig.api.baseUrl;
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  return baseUrl + path;
}


function patchColumns(columns, entitiesMetadata) {
  // Patch columns definitions to match UI specificities.
  var birth = columns.birth;
  var newColumns = {
    birth: {
      '@type': 'Integer',
      default: parseInt(birth.default.slice(0, 4)),
      label: 'Année de naissance',
      max: new Date().getFullYear(),
      min: appconfig.constants.minYear,
      val_type: 'year',
    },
  };
  var entitiesNameKeys = Lazy(entitiesMetadata).pluck('nameKey').toArray();
  var requiredColumns = Lazy(entitiesNameKeys).map(requiredColumnName => [requiredColumnName, {required: true}])
    .toObject();
  newColumns = Lazy(columns).merge(newColumns).merge(requiredColumns).toObject();
  if ('depcom' in newColumns) {
    newColumns.depcom.autocomplete = fetchCommunes;
    newColumns.depcom.label = 'Lieu de résidence';
  }
  return newColumns;
}


function patchValuesForColumns(data) {
  // Change values according to UI-specific columns.
  if (data.individus) {
    var newIndividus = Lazy(data.individus).map((individu) => {
      return individu.birth ?
        Lazy(individu).assign({birth: parseInt(individu.birth.slice(0, 4))}).toObject() :
        individu;
    }).toArray();
    var newData = Lazy(data).assign({individus: newIndividus}).toObject();
    return newData;
  } else {
    return data;
  }
}


// Data fetching and saving API calls

function fetchCommunes(term, onSuccess, onError) {
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
    onSuccess(data);
  })
  .fail(function(error) {
    onError(error);
  });
}


function fetchCurrentLocaleMessages(onSuccess, onError) {
  request
    .get(`${appconfig.i18n.baseUrlPath}/${appconfig.i18n.lang}.json`)
    // .set('Accept', 'application/json')
    .on('error', onError)
    .end(function (res) {
      if (res.error) {
        onError(res.error);
      } else {
        // Workaround: handle case when server returns no Content-Type HTTP header.
        var body = res.body || JSON.parse(res.text);
        onSuccess(body);
      }
    });
}


function fetchCurrentTestCase(onSuccess, onError) {
  request
    .get(appconfig.enabledModules.situationForm.urlPaths.currentTestCase)
    .on('error', onError)
    .end(function(res) {
      if (res.error) {
        onError(res.error);
      } else {
        onSuccess(res.body);
      }
    });
}


function fetchEntitiesMetadata(onSuccess, onError) {
  request
    .get(makeUrl(appconfig.api.urlPaths.entities))
    .on('error', onError)
    .end(function (res) {
      if (res.error) {
        onError(res.error);
      } else if (res.body && res.body.error) {
        onError(res.body.error);
      } else {
        onSuccess(res.body.entities);
      }
    });
}


function fetchFields(entitiesMetadata, onSuccess, onError) {
  request
    .get(makeUrl(appconfig.api.urlPaths.fields))
    .on('error', onError)
    .end(function(res) {
      if (res.error) {
        onError(res.error);
      } else if (res.body && res.body.error) {
        onError(res.body.error);
      } else if (res.body) {
        onSuccess({
          columns: patchColumns(res.body.columns, entitiesMetadata),
          columnsTree: res.body.columns_tree,
        });
      }
    });
}


function fetchReforms(onSuccess, onError) {
  request
    .get(makeUrl(appconfig.api.urlPaths.reforms))
    .on('error', onError)
    .end(function (res) {
      if (res.error) {
        onError(res.error);
      } else if (res.body && res.body.error) {
        onError(res.body.error);
      } else {
        // Blacklist "inversion_revenus" because it is part of "base_reforms" simulate API param.
        var reforms = {};
        if (res.body.reforms && Object.keys(res.body.reforms).length) {
          for (var reformKey in res.body.reforms) {
            if (reformKey !== 'inversion_revenus') {
              reforms[reformKey] = res.body.reforms[reformKey];
            }
          }
        }
        onSuccess(Object.keys(reforms).length ? reforms : null);
      }
    });
}


function saveCurrentTestCase(testCase, testCaseAdditionalData, onSuccess, onError) {
  request
    .post(appconfig.enabledModules.situationForm.urlPaths.currentTestCase)
    .send({
      test_case: testCase,
      test_case_additional_data: testCaseAdditionalData,
    })
    .on('error', onError)
    .end(function(res) {
      if (res.error) {
        onError(res.error);
      } else {
        // API endpoint returns no content.
        onSuccess();
      }
    });
}


// Simulation API calls

function calculate(reformKey, testCase, variables, year, force, onSuccess, onError) {
  var scenario = {
    period: {
      start: year,
      unit: 'year',
    },
    test_case: testCase,
  };
  var data = {
    base_reforms: ['inversion_revenus'],
    scenarios: [scenario],
    variables: variables,
  };
  if (reformKey) {
    data.reforms = [reformKey];
  }
  var dataStr = JSON.stringify(data);
  if ( ! force && calculateResultByDataCache[dataStr]) {
    onSuccess(calculateResultByDataCache[dataStr]);
  } else {
    request
      .post(makeUrl(appconfig.api.urlPaths.calculate))
      .send(data)
      .on('error', onError)
      .end(function(res) {
        if (res.error) {
          onError(res.error);
        } else if (res.body && res.body.error) {
          // Here we receive errors related to the simulation params (test case, year, etc.).
          // These errors are passed as "success" to be deeply dispatched inside application components.
          onSuccess({errors: res.body.error.errors[0]});
        } else {
          calculateResultByDataCache[dataStr] = res.body;
          onSuccess(res.body);
        }
      });
  }
}


function repair(testCase, year, onSuccess, onError) {
  var data = {
    scenarios: [
      {
        test_case: testCase,
        year: year,
      },
    ],
    validate: true,
  };
  request
    .post(makeUrl(appconfig.api.urlPaths.simulate))
    .send(data)
    .on('error', onError)
    .end(function(res) {
      if (res.error) {
        onError(res.error);
      } else if (res.body && res.body.error) {
        // Here we receive errors related to the simulation params (test case, year, etc.).
        // These errors are passed as "success" to be deeply dispatched inside application components.
        onSuccess({errors: res.body.error.errors[0]});
      } else {
        var testCase = res.body.repaired_scenarios[0].test_case;
        testCase = patchValuesForColumns(testCase);
        var suggestions = helpers.getObjectPath(res.body, 'suggestions', 'scenarios', '0', 'test_case');
        if (suggestions) {
          suggestions = patchValuesForColumns(suggestions);
        }
        onSuccess({
          suggestions: suggestions,
          testCase: testCase,
        });
      }
    });
}


function simulate(axes, reformKey, testCase, year, force, onSuccess, onError) {
  var scenario = {
    period: {
      start: year,
      unit: 'year',
    },
    test_case: testCase,
  };
  if (axes) {
    scenario.axes = axes;
  }
  var data = {
    base_reforms: ['inversion_revenus'],
    scenarios: [scenario],
  };
  if (reformKey) {
    data.reforms = [reformKey];
  }
  var dataStr = JSON.stringify(data);
  if ( ! force && simulateResultByDataCache[dataStr]) {
    onSuccess(simulateResultByDataCache[dataStr]);
  } else {
    request
      .post(makeUrl(appconfig.api.urlPaths.simulate))
      .send(data)
      .on('error', onError)
      .end(function(res) {
        if (res.error) {
          onError(res.error);
        } else if (res.body && res.body.error) {
          // Here we receive errors related to the simulation params (test case, year, etc.).
          // These errors are passed as "success" to be deeply dispatched inside application components.
          onSuccess({errors: res.body.error.errors[0]});
        } else {
          simulateResultByDataCache[dataStr] = res.body;
          onSuccess(res.body);
        }
      });
  }
}


module.exports = {
  calculate, fetchCurrentLocaleMessages, fetchCurrentTestCase, fetchEntitiesMetadata, fetchFields, fetchReforms, repair,
  saveCurrentTestCase, simulate,
};
