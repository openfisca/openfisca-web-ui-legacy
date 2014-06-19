/** @jsx React.DOM */
'use strict';

var React = require('react');


var Individu = React.createClass({
  propTypes: {
    errors: React.PropTypes.object,
    id: React.PropTypes.string.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func.isRequired,
    onMove: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    value: React.PropTypes.object.isRequired,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback(this.props.id);
  },
  render: function() {
    return (
      <div>
        <div className="btn-group">
          <button
            className="btn btn-default btn-sm"
            onClick={this.preventDefaultThen.bind(null, this.props.onEdit)}
            type="button">
            {this.props.value.nom_individu /* jshint ignore:line */}
            <span className="glyphicon glyphicon glyphicon-info-sign"></span>
          </button>
          <button
            className="btn btn-default btn-sm dropdown-toggle"
            data-toggle="dropdown"
            type="button">
            <span className="caret"></span>
            <span className="sr-only">Toggle Dropdown</span>
          </button>
          <ul className="dropdown-menu" role="menu">
            <li role="presentation">
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onMove)}
                role="menuitem"
                tabIndex="-1">
                Déplacer
              </a>
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onDelete)}
                role="menuitem"
                tabIndex="-1">
                Supprimer
              </a>
            </li>
          </ul>
        </div>
        <p className="text-danger">Erreur</p>
      </div>
    );
  }
});

module.exports = Individu;
