/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var cx = React.addons.classSet;


var TestCaseToolbar = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,
    displayRepairMenuItem: React.PropTypes.bool,
    hasErrors: React.PropTypes.bool,
    isSimulationInProgress: React.PropTypes.bool,
    onCreateEntity: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired,
    onRepair: React.PropTypes.func.isRequired,
    onSimulate: React.PropTypes.func.isRequired,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    var isButtonDisabled = this.props.disabled || this.props.hasErrors || this.props.isSimulationInProgress;
    return (
      <div>
        <div className="btn-group" style={{marginRight: 5}}>
          <button
            accessKey="s"
            className="btn btn-primary"
            disabled={isButtonDisabled}
            onClick={this.props.onSimulate}
            type="button">
            Simuler
          </button>
          <button
            className={cx('btn', 'btn-primary', 'dropdown-toggle', isButtonDisabled && 'disabled')}
            data-toggle="dropdown"
            id="simulation-button"
            type="button">
            <span className="caret"></span>
            <span className="sr-only">Toggle Dropdown</span>
          </button>
          <ul aria-labelledby="simulation-button" className="dropdown-menu" role="menu">
            <li role="presentation">
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onSimulate)}
                role="menuitem"
                tabindex="-1">
                Simuler
              </a>
              {
                this.props.displayRepairMenuItem && (
                  <a
                    href="#"
                    onClick={this.preventDefaultThen.bind(null, this.props.onRepair)}
                    role="menuitem"
                    tabindex="-1">
                    Réparer
                  </a>
                )
              }
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onReset)}
                role="menuitem"
                tabindex="-1">
                Réinitialiser
              </a>
            </li>
            <li className="divider" role="presentation"></li>
            <li role="presentation">
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onCreateEntity.bind(null, 'familles'))}
                role="menuitem"
                tabindex="-1">
                Ajouter une famille
              </a>
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onCreateEntity.bind(null, 'foyers_fiscaux'))}
                role="menuitem"
                tabindex="-1">
                Ajouter une déclaration d'impôt
              </a>
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onCreateEntity.bind(null, 'menages'))}
                role="menuitem"
                tabindex="-1">
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
