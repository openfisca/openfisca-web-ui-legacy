/** @jsx React.DOM */
'use strict';

require('bootstrap/js/dropdown');

var React = require('react');


var TestCaseToolbar = React.createClass({
  propTypes: {
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
    return (
      <div>
        <div className="btn-group" style={{marginRight: 5}}>
          <button
            accessKey="s"
            className="btn btn-primary"
            disabled={this.props.isSimulationInProgress}
            onClick={this.preventDefaultThen.bind(null, this.props.onSimulate)}
            type="button">
            Simuler
          </button>
          <button className="btn btn-primary dropdown-toggle" data-toggle="dropdown" type="button">
            <span className="caret"></span>
            <span className="sr-only">Toggle Dropdown</span>
          </button>
          <ul className="dropdown-menu" role="menu">
            <li>
              <a href="#" onClick={this.preventDefaultThen.bind(null, this.props.onReset)}>Réinitialiser</a>
            </li>
            <li>
              <a href="#" onClick={this.preventDefaultThen.bind(null, this.props.onRepair)}>Réparer</a>
            </li>
          </ul>
        </div>
        <div className="btn-group" style={{marginRight: 5}}>
          <button className="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">
            Ajouter <span className="caret"></span>
          </button>
          <ul className="dropdown-menu" role="menu">
            <li>
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onCreateEntity.bind(null, 'familles'))}>
                une famille
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onCreateEntity.bind(null, 'foyers_fiscaux'))}>
                une déclaration d'impôt
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onCreateEntity.bind(null, 'menages'))}>
                un logement principal
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = TestCaseToolbar;
