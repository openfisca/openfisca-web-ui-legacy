/** @jsx React.DOM */
'use strict';


var React = require('react');

var models = require('./models'),
  webservices = require('./webservices');


var appconfig = global.appconfig;


function init() {
  if (appconfig.alertOnJsError) {
    window.onerror = function(errorMsg, url, lineNumber) {
      alert(appconfig.i18n.onerrorMessage);
      // TODO call send mail webservice.
      return false;
    };
  }

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
  // if (enabledModules.legislation) {
  //   var legislation = require('./legislation');
  //   legislation.init(enabledModules.legislation);
  // }
  if (enabledModules.situationForm) {
    // TODO use promise.all()
    webservices.fetchEntitiesMetadata(entitiesMetadata => {
      if (! entitiesMetadata) {
        throw new Error('entitiesMetadata are empty');
      }
      webservices.fetchCurrentLocaleMessages(messages => {
        if (! messages) {
          throw new Error('messages are empty');
        }
        // TODO fetch fields after loading app?
        webservices.fetchFields(entitiesMetadata, fields => {
          if (! fields) {
            throw new Error('fields are empty');
          }
          if (fields.error) {
             throw new Error(fields.error);
          }
          var {columns, columnsTree} = fields;
          var Simulator = require('./components/simulator'),
            mountNode = document.getElementById('simulator-container');
          var formats = {
            number: {
              currencyStyle: {
                currency: 'EUR', // TODO parametrize in appconfig
                style: 'currency',
              },
            },
          };
          React.renderComponent(
            <Simulator
              columns={columns}
              columnsTree={columnsTree}
              disableSave={ !! enabledModules.acceptCookiesModal}
              entitiesMetadata={entitiesMetadata}
              formats={formats}
              locales={appconfig.i18n.lang}
              messages={messages}
            />,
            mountNode
          );
      });
      });
    });
  }
}

module.exports = {init: init};
