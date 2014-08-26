/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var cx = React.addons.classSet;


var TestCaseToolbar = React.createClass({
  propTypes: {
    disableSimulate: React.PropTypes.bool,
    displayRepairMenuItem: React.PropTypes.bool,
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
            Simuler
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
                  ! this.props.disableSimulate && this.props.onSimulate();
                }}
                role="menuitem"
                tabIndex="-1">
                Simuler
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
                    Réparer
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
                Réinitialiser
              </a>
            </li>
            <li className="divider" role="presentation"></li>
            <li role="presentation">
              <a
                href="#"
                onClick={event => { event.preventDefault(); this.props.onCreateEntity('familles'); }}
                role="menuitem"
                tabIndex="-1">
                Ajouter une famille
              </a>
              <a
                href="#"
                onClick={event => { event.preventDefault(); this.props.onCreateEntity('foyers_fiscaux'); }}
                role="menuitem"
                tabIndex="-1">
                Ajouter une déclaration d'impôt
              </a>
              <a
                href="#"
                onClick={event => { event.preventDefault(); this.props.onCreateEntity('menages'); }}
                role="menuitem"
                tabIndex="-1">
                Ajouter un logement principal
              </a>
            </li>
          </ul>
        </div>
        {this.props.isSimulationInProgress && <span className="label label-default">Simulation</span>}
      </div>
    );
  }
});

module.exports = TestCaseToolbar;
