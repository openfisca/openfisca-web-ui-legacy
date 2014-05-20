define([
  'jquery',
  'Q',

  'AcceptCnilConditionsModalV',
  'AcceptCookiesModalV',
  'appconfig',
  'auth',
  'chartsV',
  'disclaimer',
  'legislation',
  'router',
  'situationForm',
  'testCasesServiceM',
],
function ($, Q, AcceptCnilConditionsModalV, AcceptCookiesModalV, appconfig, auth, chartsV, disclaimer,
  legislation, router, situationForm, testCasesServiceM) {
  'use strict';

  function init() {
    Q.longStackSupport = appconfig.debug;
    Q.onerror = function(error) {
      console.error(error.stack);
    };

    var enabledModules = appconfig.enabledModules;
    if (enabledModules.auth) {
      auth.init(enabledModules.auth);
    }
    if (enabledModules.acceptCookiesModal) {
      window.acceptCookiesModalV = new AcceptCookiesModalV();
    }
    else if (enabledModules.acceptCnilConditionsModal) {
      window.acceptCnilConditionsModalV = new AcceptCnilConditionsModalV();
    }
    if ( ! enabledModules.acceptCookiesModal && ! enabledModules.acceptCnilConditionsModal) {
      if (enabledModules.disclaimer) {
        disclaimer.init(enabledModules.disclaimer);
      }
    }
    if (enabledModules.legislation) {
      legislation.init(enabledModules.legislation);
    }
    if (enabledModules.situationForm) {
      testCasesServiceM.fetchCurrentTestCaseAsync()
      .then(function(data) {
        var promise;
        if (data === null) {
          promise = situationForm.resetTestCaseAsync();
        } else {
          promise = Q(situationForm).invoke('set', 'testCase', data);
        }
        return promise
        .then(function() { return situationForm.repairTestCaseAsync(); })
        .then(function() { return chartsV.model.simulateAsync(situationForm.get('testCaseForAPI')); });
      })
      .then(function() { router.init(); })
      .done();
    }
  }

  return {init: init};
});
