/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  ReactIntlMixin = require('react-intl');

var YearInput = require('./year-input');


var appconfig = global.appconfig,
  cx = React.addons.classSet;


var TestCaseToolbar = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    disableSimulate: React.PropTypes.bool,
    displayRepairMenuItem: React.PropTypes.bool,
    entitiesMetadata: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    getEntitiesKinds: React.PropTypes.func.isRequired,
    onCreateEntity: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired,
    onRepair: React.PropTypes.func.isRequired,
    onSimulate: React.PropTypes.func.isRequired,
    onYearChange: React.PropTypes.func.isRequired,
    reformName: React.PropTypes.string,
    testCase: React.PropTypes.object,
    year: React.PropTypes.number,
  },
  getDefaultProps: function() {
    return {
      displayRepairMenuItem: false,
    };
  },
  render: function() {
    var simulation = {
      scenarios: [
        {
          test_case: this.props.testCase,
          year: this.props.year,
        },
      ],
      variables: ["revdisp"],
    };
    if (this.props.reformName) {
      simulation.base_reforms = [this.props.reformName];
    }
    var simulationJsonStr = JSON.stringify(simulation);
    var traceUrl = `${appconfig['urls.www']}outils/trace?simulation=${simulationJsonStr}&api_url=${appconfig.api.baseUrl}`;
    return (
      <div className='row'>
        <div className='col-xs-6'>
          <div className="btn-group" style={{marginRight: 5}}>
            <button
              accessKey="a"
              className="btn btn-primary dropdown-toggle"
              data-toggle="dropdown"
              id="simulation-button"
              type="button">
              <span>{this.getIntlMessage('actions')}</span> <span className="caret"></span>
            </button>
            <ul aria-labelledby="simulation-button" className="dropdown-menu" role="menu">
              <li className={cx({disabled: this.props.disableSimulate})} role="presentation">
                <a
                  accessKey="s"
                  href="#"
                  onClick={event => {
                    event.preventDefault();
                    if (! this.props.disableSimulate) {
                      this.props.onSimulate();
                    }
                  }}
                  role="menuitem"
                  tabIndex="-1">
                  {this.getIntlMessage('simulate')}
                </a>
              </li>
              <li role="presentation">
                <a href={traceUrl} role="menuitem" tabIndex="-1" target='_blank'>
                  {this.getIntlMessage('trace')}
                </a>
              </li>
              {
                this.props.displayRepairMenuItem && (
                  <li role="presentation">
                    <a
                      href="#"
                      onClick={event => { event.preventDefault(); this.props.onRepair(); }}
                      role="menuitem"
                      tabIndex="-1">
                      {this.getIntlMessage('repair')}
                    </a>
                  </li>
                )
              }
              <li role="presentation">
                <a
                  href="#"
                  onClick={event => { event.preventDefault(); this.props.onReset(); }}
                  role="menuitem"
                  tabIndex="-1">
                  {this.getIntlMessage('reset')}
                </a>
              </li>
              <li className="divider" role="presentation"></li>
              <li role="presentation">
                {
                  this.props.getEntitiesKinds(this.props.entitiesMetadata, {persons: false}).map(kind => (
                    <a
                      href="#"
                      key={kind}
                      onClick={event => { event.preventDefault(); this.props.onCreateEntity(kind); }}
                      role="menuitem"
                      tabIndex="-1">
                      {this.getIntlMessage(`addEntity:${kind}`)}
                    </a>
                  ))
                }
              </li>
            </ul>
          </div>
        </div>
        <div className={cx({
          'col-lg-offset-2': true,
          'col-lg-4': true,
          'col-xs-6': true,
          'has-error': this.props.errors && this.props.errors.period,
        })}>
          <YearInput
            error={this.props.errors && this.props.errors.period && this.props.errors.period['1']}
            onChange={this.props.onYearChange}
            value={this.props.year}
          />
        </div>
      </div>
    );
  }
});

module.exports = TestCaseToolbar;
