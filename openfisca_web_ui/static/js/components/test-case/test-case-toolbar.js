/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  ReactIntlMixin = require('react-intl');

var cx = React.addons.classSet;


var TestCaseToolbar = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    disableSimulate: React.PropTypes.bool,
    displayRepairMenuItem: React.PropTypes.bool,
    entitiesMetadata: React.PropTypes.object.isRequired,
    getEntitiesKinds: React.PropTypes.func.isRequired,
    isSimulationInProgress: React.PropTypes.bool,
    onCreateEntity: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired,
    onRepair: React.PropTypes.func.isRequired,
    onSimulate: React.PropTypes.func.isRequired,
  },
  getDefaultProps: function() {
    return {
      displayRepairMenuItem: false,
    };
  },
  render: function() {
    return (
      <div>
        <div className="btn-group" style={{marginRight: 5}}>
          <button
            accessKey="s"
            className="btn btn-primary"
            disabled={this.props.disableSimulate}
            onClick={this.props.onSimulate}
            type="button">
            {this.getIntlMessage('simulate')}
          </button>
          <button
            className={cx('btn', 'btn-primary', 'dropdown-toggle')}
            data-toggle="dropdown"
            id="simulation-button"
            type="button">
            <span className="caret"></span>
            <span className="sr-only">Toggle Dropdown</span>
          </button>
          <ul aria-labelledby="simulation-button" className="dropdown-menu" role="menu">
            <li className={cx({disabled: this.props.disableSimulate})} role="presentation">
              <a
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
        {
          this.props.isSimulationInProgress && (
            <span className="label label-default">Simulation en cours</span>
          )
        }
      </div>
    );
  }
});

module.exports = TestCaseToolbar;
