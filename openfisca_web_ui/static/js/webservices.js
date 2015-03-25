'use strict';

var $ = require('jquery'),
  Lazy = require('lazy.js'),
  request = require('superagent');

var helpers = require('./helpers'),
  testCases = require('./test-cases');


var appconfig = global.appconfig;
var calculateResultByDataCache = {};
var simulateResultByDataCache = {};


// Utils


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
      } else if (res.body) {
        // Workaround: handle case when server returns no Content-Type HTTP header.
        var body = res.body || JSON.parse(res.text);
        onSuccess(body);
      } else {
        onError(new Error('Response body is empty'));
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
      } else if (res.body) {
        onSuccess(res.body);
      } else {
        onError(new Error('Response body is empty'));
      }
    });
}


function fetchEntitiesMetadata(onSuccess, onError) {
  request
    .get(appconfig.api.entitiesUrl)
    .on('error', onError)
    .end(function (res) {
      if (res.body && res.body.error) {
        onError(res.body.error);
      } else if (res.error) {
        onError(res.error);
      } else if (res.body) {
        onSuccess(res.body.entities);
      } else {
        onError(new Error('Response body is empty'));
      }
    });
}


function fetchFields(entitiesMetadata, onSuccess, onError) {
  request
    .get(appconfig.api.fieldsUrl)
    .on('error', onError)
    .end(function(res) {
      if (res.body && res.body.error) {
        onError(res.body.error);
      } else if (res.error) {
        onError(res.error);
      } else if (res.body) {
        if ( ! res.body.columns || Object.keys(res.body.columns).length === 0) {
          onError(new Error('columns is empty'));
        }
        if ( ! res.body.columns_tree || Object.keys(res.body.columns_tree).length === 0) {
          onError(new Error('columns_tree is empty'));
        }
        onSuccess({
          columns: patchColumns(res.body.columns, entitiesMetadata),
          columnsTree: res.body.columns_tree,
        });
      } else {
        onError(new Error('Response body is empty'));
      }
    });
}


function fetchReforms(onSuccess, onError) {
  request
    .get(appconfig.api.reformsUrl)
    .on('error', onError)
    .end(function (res) {
      if (res.body && res.body.error) {
        onError(res.body.error);
      } else if (res.error) {
        onError(res.error);
      } else if (res.body) {
        // Exclude values included in appconfig.base_reforms.
        var reforms = {};
        if (res.body.reforms && Object.keys(res.body.reforms).length) {
          for (var reformKey in res.body.reforms) {
            if ( ! appconfig.base_reforms || ! appconfig.base_reforms.includes(reformKey)) {
              reforms[reformKey] = res.body.reforms[reformKey];
            }
          }
        }
        onSuccess(Object.keys(reforms).length ? reforms : null);
      } else {
        onError(new Error('Response body is empty'));
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

function calculate(entitiesMetadata, reformKey, testCase, variables, year, force, onSuccess, onError) {
  var scenario = {
    period: {
      start: year,
      unit: 'year',
    },
    test_case: testCases.duplicateValuesOverThreeYears(entitiesMetadata, testCase, year),
  };
  var data = {
    scenarios: [scenario],
    variables: variables,
  };
  if (appconfig.base_reforms) {
    data.base_reforms = appconfig.base_reforms;
  }
  if (reformKey) {
    data.reforms = [reformKey];
  }
  var dataStr = JSON.stringify(data);
  if ( ! force && calculateResultByDataCache[dataStr]) {
    onSuccess(calculateResultByDataCache[dataStr]);
  } else {
    request
      .post(appconfig.api.calculateUrl)
      .send(data)
      .on('error', onError)
      .end(function(res) {
        if (res.body && res.body.error) {
          // Here we receive errors related to the simulation params (test case, year, etc.).
          // These errors are passed as "success" to be deeply dispatched inside application components.
          onSuccess({errors: res.body.error.errors[0]});
        } else if (res.error) {
          onError(res.error);
        } else if (res.body) {
          calculateResultByDataCache[dataStr] = res.body;
          onSuccess(res.body);
        } else {
          onError(new Error('Response body is empty'));
        }
      });
  }
}


function repair(testCase, year, onSuccess, onError) {
  var data = {
    scenarios: [
      {
        test_case: testCase,
        period: {
          start: year,
          unit: 'year',
        },
      },
    ],
    validate: true,
  };
  request
    .post(appconfig.api.repairUrl)
    .send(data)
    .on('error', onError)
    .end(function(res) {
      if (res.body && res.body.error) {
        // Here we receive errors related to the simulation params (test case, year, etc.).
        // These errors are passed as "success" to be deeply dispatched inside application components.
        onSuccess({errors: res.body.error.errors[0]});
      } else if (res.error) {
        onError(res.error);
      } else if (res.body) {
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
      } else {
        onError(new Error('Response body is empty'));
      }
    });
}


function simulate(axes, entitiesMetadata, reformKey, testCase, year, force, onSuccess, onError) {
  var scenario = {
    period: {
      start: year,
      unit: 'year',
    },
    test_case: testCases.duplicateValuesOverThreeYears(entitiesMetadata, testCase, year),
  };
  if (axes) {
    scenario.axes = axes;
  }
  var data = {
    scenarios: [scenario],
  };
  if (appconfig.base_reforms) {
    data.base_reforms = appconfig.base_reforms;
  }
  if (reformKey) {
    data.reforms = [reformKey];
  }
  var dataStr = JSON.stringify(data);
  if ( ! force && simulateResultByDataCache[dataStr]) {
    onSuccess(simulateResultByDataCache[dataStr]);
  } else {
    request
      .post(appconfig.api.simulateUrl)
      .send(data)
      .on('error', onError)
      .end(function(res) {
        if (res.body && res.body.error) {
          // Here we receive errors related to the simulation params (test case, year, etc.).
          // These errors are passed as "success" to be deeply dispatched inside application components.
          onSuccess({errors: res.body.error.errors[0]});
        } else if (res.error) {
          onError(res.error);
        } else if (res.body) {
          simulateResultByDataCache[dataStr] = res.body;
          onSuccess(res.body);
        } else {
          onError(new Error('Response body is empty'));
        }
      });
  }
}


module.exports = {
  calculate, fetchCurrentLocaleMessages, fetchCurrentTestCase, fetchEntitiesMetadata, fetchFields, fetchReforms, repair,
  saveCurrentTestCase, simulate,
};
