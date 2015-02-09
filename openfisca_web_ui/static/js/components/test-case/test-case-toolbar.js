/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  ReactIntlMixin = require('react-intl');


var appconfig = global.appconfig,
  cx = React.addons.classSet;


var TestCaseToolbar = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    disabled: React.PropTypes.bool,
    displayRepairMenuItem: React.PropTypes.bool,
    entitiesMetadata: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    getEntitiesKinds: React.PropTypes.func.isRequired,
    onCreateEntity: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired,
    onRepair: React.PropTypes.func.isRequired,
    onSimulate: React.PropTypes.func.isRequired,
    reformKey: React.PropTypes.string,
    testCase: React.PropTypes.object,
    year: React.PropTypes.number,
  },
  getDefaultProps: function() {
    return {
      displayRepairMenuItem: false,
    };
  },
  getTraceUrl: function() {
    var simulation = {
      scenarios: [
        {
          test_case: this.props.testCase,
          year: this.props.year,
        },
      ],
      variables: ["revdisp"],
    };
    if (this.props.reformKey) {
      simulation.base_reforms = [this.props.reformKey];
    }
    var simulationJsonStr = JSON.stringify(simulation);
    var traceUrl = `${appconfig['urls.www']}outils/trace?simulation=${simulationJsonStr}&api_url=${appconfig.api.baseUrl}`;
    return traceUrl;
  },
  render: function() {
    return (
      <div className="btn-group" style={{marginRight: 5}}>
        <button
          accessKey="a"
          className="btn btn-primary dropdown-toggle"
          data-toggle="dropdown"
          id="actions-button"
          type="button">
          <span>{this.getIntlMessage('actions')}</span> <span className="caret"></span>
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
    );
  }
});

module.exports = TestCaseToolbar;
