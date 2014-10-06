/** @jsx React.DOM */
'use strict';


var React = require('react');

var models = require('./models'),
  webservices = require('./webservices');


var appconfig = global.appconfig;


function init() {
  window.onerror = function(errorMsg, url, lineNumber) {
    if ( ! appconfig.debug) {
      alert(appconfig.i18n.onerrorMessage);
      // TODO call send mail webservice.
      window.location.reload();
    }
    return false;
  };

  var enabledModules = appconfig.enabledModules;
  if (enabledModules.auth) {
    var auth = require('./auth');
    auth.init(enabledModules.auth);
  }
  var jsModal = document.getElementById('js-modal');
  if (enabledModules.acceptCookiesModal) {
    var AcceptCookiesModal = require('./components/accept-cookies-modal');
    webservices.fetchCurrentLocaleMessages(messages => {
      React.renderComponent(
        <AcceptCookiesModal actionUrlPath={enabledModules.acceptCookiesModal.actionUrlPath} messages={messages} />,
        jsModal
      );
    });
  }
  else if (enabledModules.acceptCnilConditionsModal) {
    var AcceptCnilConditionsModal = require('./components/accept-cnil-conditions-modal');
    webservices.fetchCurrentLocaleMessages(messages => {
      React.renderComponent(
        <AcceptCnilConditionsModal
          actionUrlPath={enabledModules.acceptCnilConditionsModal.actionUrlPath}
          messages={messages}
          privacyPolicyUrlPath={enabledModules.acceptCnilConditionsModal.privacyPolicyUrlPath}
        />,
        jsModal
      );
    });
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
    // TODO use promise.all()
    webservices.fetchEntitiesMetadata(entitiesMetadata => {
      webservices.fetchCurrentLocaleMessages(messages => {
        webservices.fetchFields(entitiesMetadata, fields => {
          if (fields) {
            if (fields.error) {
               throw new Error(fields.error);
            }
            var {columns, columnsTree} = fields;
            var Simulator = require('./components/simulator'),
              mountNode = document.getElementById('simulator-container');
            React.renderComponent(
              <Simulator
                columns={columns}
                columnsTree={columnsTree}
                disableSave={ !! enabledModules.acceptCookiesModal}
                entitiesMetadata={entitiesMetadata}
                locales={appconfig.i18n.lang}
                messages={messages}
              />,
              mountNode
            );
          } else {
            throw new Error('Unable to fetch fields');
          }
        });
      });
    });
  }
}

module.exports = {init: init};
