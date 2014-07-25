/** @jsx React.DOM */
'use strict';


var React = require('react');

// Required by some deep parts of the application.
require('bootstrap/js/collapse');
require('bootstrap/js/alert');
require('bootstrap/js/dropdown');
require('bootstrap/js/modal');
require('bootstrap/js/transition');


var appconfig = global.appconfig;


function init() {
  var enabledModules = appconfig.enabledModules;
  if (enabledModules.auth) {
    var auth = require('./auth');
    auth.init(enabledModules.auth);
  }
  var jsModal = document.getElementById('js-modal');
  if (enabledModules.acceptCookiesModal) {
    var AcceptCookiesModal = require('./components/accept-cookies-modal');
    React.renderComponent(
      <AcceptCookiesModal actionUrlPath={enabledModules.acceptCookiesModal.actionUrlPath} />,
      jsModal
    );
  }
  else if (enabledModules.acceptCnilConditionsModal) {
    var AcceptCnilConditionsModal = require('./components/accept-cnil-conditions-modal');
    React.renderComponent(
      <AcceptCnilConditionsModal
        actionUrlPath={enabledModules.acceptCnilConditionsModal.actionUrlPath}
        termsUrlPath={enabledModules.acceptCnilConditionsModal.termsUrlPath}
      />,
      jsModal
    );

  }
  if ( ! enabledModules.acceptCookiesModal && ! enabledModules.acceptCnilConditionsModal) {
    if (enabledModules.disclaimer) {
      var disclaimer = require('./disclaimer');
      disclaimer.init(enabledModules.disclaimer);
    }
  }
  if (enabledModules.legislation) {
    var legislation = require('./legislation');
    legislation.init(enabledModules.legislation);
  }
  if (enabledModules.situationForm) {
    var Simulator = require('./components/simulator');
    var mountNode = document.getElementById('simulator-container');
    React.renderComponent(<Simulator />, mountNode);
  }
}

module.exports = {init: init};
