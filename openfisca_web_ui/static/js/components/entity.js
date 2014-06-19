/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var Individu = require('./individu');


var Entity = React.createClass({
  propTypes: {
    entity: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    id: React.PropTypes.string.isRequired,
    individus: React.PropTypes.object.isRequired,
    kind: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func.isRequired,
    onEditIndividu: React.PropTypes.func.isRequired,
    onMoveIndividu: React.PropTypes.func.isRequired,
    roles: React.PropTypes.array.isRequired,
    suggestions: React.PropTypes.object,
  },
  forIndividu: function(id, key) {
    return this.props[key] && this.props[key].individus ? this.props[key].individus[id] : null;
  },
  hasErrors: function() {
    return this.props.errors;
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    return (
      <div className={React.addons.classSet('panel', this.hasErrors() ? 'panel-danger' : 'panel-default')}>
        <div className="panel-heading">
          <div className="btn-group">
            <button
              className="btn btn-default btn-sm"
              onClick={this.preventDefaultThen.bind(null, this.props.onEdit.bind(null, this.props.kind, this.props.id))}
              type="button">
              {this.props.label}
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
          {
            this.props.roles.map(function(item) {
              return this.renderRole(item.role, item.label, item.isSingleton);
            }, this)
          }
        </div>
      </div>
    );
  },
  renderIndividu: function(id) {
    return (
      <Individu
        errors={this.forIndividu(id, 'errors')}
        id={id}
        key={id}
        onDelete={this.props.onDeleteIndividu}
        onEdit={this.props.onEditIndividu}
        onMove={this.props.onMoveIndividu}
        suggestions={this.forIndividu(id, 'suggestions')}
        value={this.props.individus[id]}
      />
    );
  },
  renderRole: function(role, label, isSingleton) {
    var individus;
    var roleData = this.props.entity[role];
    if (roleData) {
      if (isSingleton) {
        individus = this.renderIndividu(roleData);
      } else {
        individus = roleData.map(function(id) {
          return this.renderIndividu(id);
        }, this);
      }
    }
    var addLink = ( ! isSingleton || ! roleData) ? (
      <a
        href="#"
        onClick={
          this.preventDefaultThen.bind(null, this.props.onCreateIndividuInEntity.bind(
            null, this.props.kind, this.props.id, role
          ))
        }>
        Ajouter
      </a>
    ) : null;
    return (
      <div className="list-group-item" key={role}>
        <p>{label}</p>
        {
          this.props.errors && this.props.errors[role] ?
            <p className="text-danger">{this.props.errors[role]}</p>
            : null
        }
        {individus}
        {addLink}
      </div>
    );
  },
});

module.exports = Entity;
