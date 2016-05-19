import { render } from 'react-dom'

import testCases from './test-cases'
import webservices from './webservices'

var appconfig = global.appconfig

export function init () {
  if (appconfig.alertOnJsError) {
    window.onerror = function (/*errorMsg, url, lineNumber*/) {
      alert(appconfig.i18n.onerrorMessage)
      // TODO call send mail webservice.
      return false
    }
  }

  var enabledModules = appconfig.enabledModules
  if (enabledModules.auth) {
    var auth = require('./auth')
    auth.init(enabledModules.auth)
  }
  if (enabledModules.situationForm) {
    var renderSimulator = (entitiesMetadata, fields, messages, reforms, testCaseData) => {
      var Simulator = require('./components/simulator')
      var mountElement = document.getElementById('simulator-container')
      var {columns, columnsTree} = fields
      var formats = {
        number: {
          currencyStyle: {
            currency: 'EUR', // TODO parametrize in appconfig
            style: 'currency',
          },
        },
      }
      var testCase = testCaseData ? testCaseData.test_case : null
      if (!testCase) {
        testCase = testCases.getInitialTestCase(entitiesMetadata)
      }
      var testCaseAdditionalData = testCaseData ? testCaseData.test_case_additional_data : null
      var year = appconfig.constants.defaultYear
      webservices.repair(testCase, year, (result) => {
        render(
          <Simulator
            columns={columns}
            columnsTree={columnsTree}
            disableSave={Boolean(enabledModules.acceptCookiesModal)}
            entitiesMetadata={entitiesMetadata}
            formats={formats}
            locales={appconfig.i18n.lang}
            messages={messages}
            reforms={reforms}
            testCase={result.testCase}
            testCaseAdditionalData={testCaseAdditionalData}
            year={year} />,
          mountElement
        )
      })
    }
    var fetchCurrentTestCaseIfNeeded = (onSuccess, onError) => {
      if (enabledModules.acceptCookiesModal) {
        onSuccess(null)
      } else {
        webservices.fetchCurrentTestCase(onSuccess, onError)
      }
    }
    // TODO strict; promise.all()
    webservices.fetchEntitiesMetadata(
      (entitiesMetadata) => {
        webservices.fetchCurrentLocaleMessages(
          (messages) => {
            // TODO fetch fields after loading app?
            webservices.fetchFields(
              entitiesMetadata,
              (fields) => {
                fetchCurrentTestCaseIfNeeded(
                  (testCaseData) => {
                    webservices.fetchReforms(
                      (reforms) => {
                        const reformsBlacklist = ['inversion_revenus']
                        var validReforms = Lazy(reforms).omit(reformsBlacklist).toObject()
                        if (Object.keys(validReforms).length === 0) {
                          validReforms = null
                        }
                        renderSimulator(entitiesMetadata, fields, messages, validReforms, testCaseData)
                      },
                      (error) => {
                        console.error(error)
                        alert('Error: unable to fetch reforms.')
                      }
                    )
                  },
                  (error) => {
                    console.error(error)
                    alert('Error: unable to fetch current test case.')
                  }
                )
              },
              (error) => {
                console.error(error)
                alert('Error: unable to fetch fields.')
              }
            )
          },
          (error) => {
            console.error(error)
            alert('Error: unable to load language files.')
          }
        )
      },
      (error) => {
        console.error(error)
        alert('Error: unable to fetch entities metadata.')
      }
    )
  }
}
