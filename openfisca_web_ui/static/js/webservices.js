'use strict';

var request = require('superagent');

var appconfig = global.appconfig;


function fetchCurrentTestCase(onCurrentTestCaseFetched) {
  request
    .get(appconfig.enabledModules.situationForm.urlPaths.currentTestCase)
    .end(function(res) {
      onCurrentTestCaseFetched(res.body);
    });
}

module.exports = {fetchCurrentTestCase: fetchCurrentTestCase};
