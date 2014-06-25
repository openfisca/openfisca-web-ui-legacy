/** @jsx React.DOM */
'use strict';


var React = require('react');

// Required by some deep parts of the application.
require('bootstrap/js/collapse');
require('bootstrap/js/dropdown');
require('bootstrap/js/modal');
require('bootstrap/js/transition');


var AcceptCnilConditionsModalV = require('./views/AcceptCnilConditionsModalV'),
  AcceptCookiesModalV = require('./views/AcceptCookiesModalV'),
  auth = require('./auth'),
//  chartsV = require('./views/chartsV'),
  disclaimer = require('./disclaimer'),
  legislation = require('./legislation'),
//  router = require('./router'),
  Simulator = require('./components/simulator');
//  situationForm = require('./components/situationForm'),
//  testCasesServiceM = require('./models/testCasesServiceM');

var appconfig = global.appconfig;


function init() {
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
    var mountNode = document.getElementById('simulator-container');
    React.renderComponent(<Simulator />, mountNode);
  }
}

module.exports = {init: init};
