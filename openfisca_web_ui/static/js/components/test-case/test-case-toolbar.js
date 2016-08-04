/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  ReactIntlMixin = require('react-intl');

var testCases = require('../../test-cases');


var appconfig = global.appconfig,
  cx = React.addons.classSet;


var TestCaseToolbar = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    disabled: React.PropTypes.bool,
    displayRepairMenuItem: React.PropTypes.bool,
    entitiesMetadata: React.PropTypes.object.isRequired,
    getEntitiesKinds: React.PropTypes.func.isRequired,
    isSimulationInProgress: React.PropTypes.bool,
    onCreateEntity: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired,
    onRepair: React.PropTypes.func.isRequired,
    onSimulate: React.PropTypes.func.isRequired,
    reformKey: React.PropTypes.string,
    testCase: React.PropTypes.object,
    year: React.PropTypes.number.isRequired,
  },
  getDefaultProps() {
    return {
      displayRepairMenuItem: false,
    };
  },
  getTraceUrl() {
    var simulation = {
      scenarios: [
        {
          test_case: testCases.duplicateValuesOverPastYears(this.props.entitiesMetadata, this.props.testCase,
            this.props.year),
          year: this.props.year,
        },
      ],
      variables: ["revdisp"],
    };
    if (this.props.reformKey) {
      simulation.base_reforms = [this.props.reformKey];
    }
    var simulationJsonStr = JSON.stringify(simulation);
    var traceQueryString = `simulation=${simulationJsonStr}&api_url=${appconfig.api.baseUrl}`;
    var traceUrl = `${appconfig['urls.www']}tools/trace?${traceQueryString}`;
    return traceUrl;
  },
  render() {
    return (
      <div className='clearfix test-case-toolbar'>
        <div className="btn-group">
          <button
            accessKey="a"
            className="btn btn-primary dropdown-toggle"
            data-toggle="dropdown"
            id="actions-button"
            type="button">
            <span>{this.getIntlMessage('actions')}</span>
            {' '}
            <span className="caret"></span>
          </button>
          <ul aria-labelledby="actions-button" className="dropdown-menu" role="menu">
            <li className={cx({disabled: this.props.disabled})} role="presentation">
              <a
                accessKey="s"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (! this.props.disabled) {
                    this.props.onSimulate();
                  }
                }}
                role="menuitem"
                tabIndex="-1">
                {this.getIntlMessage('simulate')}
              </a>
            </li>
            <li className={cx({disabled: this.props.disabled})} role="presentation">
              <a href={this.getTraceUrl()} role="menuitem" tabIndex="-1" target='_blank'>
                {this.getIntlMessage('trace')}
              </a>
            </li>
            {
              this.props.displayRepairMenuItem && (
                <li className={cx({disabled: this.props.disabled})} role="presentation">
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (! this.props.disabled) {
                        this.props.onRepair();
                      }
                    }}
                    role="menuitem"
                    tabIndex="-1">
                    {this.getIntlMessage('repair')}
                  </a>
                </li>
              )
            }
            <li className={cx({disabled: this.props.disabled})} role="presentation">
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (! this.props.disabled) {
                    this.props.onReset();
                  }
                }}
                role="menuitem"
                tabIndex="-1">
                {this.getIntlMessage('reset')}
              </a>
            </li>
            <li className="divider" role="presentation"></li>
            <li className={cx({disabled: this.props.disabled})} role="presentation">
              {
                this.props.getEntitiesKinds(this.props.entitiesMetadata, {persons: false}).map(kind => (
                  <a
                    href="#"
                    key={kind}
                    onClick={(event) => {
                      event.preventDefault();
                      if (! this.props.disabled) {
                        this.props.onCreateEntity(kind);
                      }
                    }}
                    role="menuitem"
                    tabIndex="-1">
                    {this.getIntlMessage(`addEntity:${kind}`)}
                  </a>
                ))
              }
            </li>
          </ul>
        </div>
        {
          this.props.isSimulationInProgress && (
            <span className='pull-right'>{this.getIntlMessage('loading')}</span>
          )
        }
      </div>
    );
  }
});

module.exports = TestCaseToolbar;
