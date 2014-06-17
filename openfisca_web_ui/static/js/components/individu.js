/** @jsx React.DOM */
'use strict';

var React = require('react');


var Individu = React.createClass({
  propTypes: {
    onDelete: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func.isRequired,
    onMove: React.PropTypes.func.isRequired,
    value: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <div>
        <div className="btn-group">
          <button className="btn btn-default btn-sm" onClick={this.props.onEdit} type="button">
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
              <a href="#" onClick={this.props.onMove} role="menuitem" tabIndex="-1">Déplacer</a>
              <a href="#" onClick={this.props.onDelete} role="menuitem" tabIndex="-1">Supprimer</a>
            </li>
          </ul>
        </div>
        <p className="text-danger">Erreur</p>
      </div>
    );
  }
});

module.exports = Individu;
