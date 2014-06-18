/** @jsx React.DOM */
'use strict';

var React = require('react');

var Individu = require('./individu'),
  models = require('../models');


var Entity = React.createClass({
  propTypes: {
    errors: React.PropTypes.object,
    id: React.PropTypes.string.isRequired,
    individuIdsByRole: React.PropTypes.object.isRequired,
    individus: React.PropTypes.object.isRequired,
    kind: React.PropTypes.string.isRequired,
    onAddIndividuInEntity: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func.isRequired,
    onEditIndividu: React.PropTypes.func.isRequired,
    onMoveIndividu: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="btn-group">
            <button
              className="btn btn-default btn-sm"
              onClick={this.preventDefaultThen.bind(null, this.props.onEdit.bind(null, this.props.kind, this.props.id))}
              type="button">
              {models.TestCase.getEntityLabel(this.props.kind, this.props.individuIdsByRole)}
            </button>
            <button
              className="btn btn-default btn-sm dropdown-toggle"
              data-toggle="dropdown"
              type="button">
              <span className="caret"></span>
              <span className="sr-only">Toggle Dropdown</span>
            </button>
            <ul className="dropdown-menu" role="menu">
              <li>
                <a
                  href="#"
                  onClick={
                    this.preventDefaultThen.bind(null, this.props.onDelete.bind(null, this.props.kind, this.props.id))
                  }>
                  Supprimer
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="list-group">
          {this.renderRole('parents', 'Parents')}
          {this.renderRole('enfants', 'Enfants')}
        </div>
      </div>
    );
  },
  renderRole: function(role, label) {
    return (
      <div className="list-group-item">
        <p>{label}</p>
        {/* this.props.errors ? <p className="text-danger">{{.error}}</p> : null */}
        <ul>
          {
            role in this.props.individuIdsByRole ?
              this.props.individuIdsByRole[role].map(function(individuId) {
                return (
                  <li key={individuId}>
                    <Individu
                      id={individuId}
                      onDelete={this.props.onDeleteIndividu}
                      onEdit={this.props.onEditIndividu}
                      onMove={this.props.onMoveIndividu}
                      value={this.props.individus[individuId]}
                    />
                  </li>
                );
              }, this) : null
          }
          <li>
            <a
              href="#"
              onClick={
                this.preventDefaultThen.bind(null, this.props.onAddIndividuInEntity.bind(
                  null, this.props.kind, this.props.id, role
                ))
              }>
              Ajouter
            </a>
          </li>
        </ul>
      </div>
    );
  },
});

module.exports = Entity;
