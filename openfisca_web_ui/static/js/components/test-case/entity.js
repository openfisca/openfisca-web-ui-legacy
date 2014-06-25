/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var Individu = require('./individu');


var Entity = React.createClass({
  propTypes: {
    editedEntity: React.PropTypes.object,
    errors: React.PropTypes.object,
    id: React.PropTypes.string.isRequired,
    individus: React.PropTypes.object.isRequired,
    kind: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func.isRequired,
    onMoveIndividu: React.PropTypes.func.isRequired,
    roles: React.PropTypes.array.isRequired,
    suggestions: React.PropTypes.object,
    value: React.PropTypes.object.isRequired,
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
    var editedEntity = this.props.editedEntity;
    var disabled = !! editedEntity;
    var btnColorClass = editedEntity && editedEntity.id === this.props.id ? 'btn-info' : 'btn-default';
    return (
      <div className={React.addons.classSet('panel', this.hasErrors() ? 'panel-danger' : 'panel-default')}>
        <div className="panel-heading">
          <div className="btn-group">
            <button
              className={React.addons.classSet('btn', btnColorClass, 'btn-sm')}
              disabled={disabled}
              onClick={this.props.onEdit.bind(null, this.props.kind, this.props.id)}
              type="button">
              {this.props.label}
            </button>
            <button
              className={
                React.addons.classSet('btn', btnColorClass, 'btn-sm', 'dropdown-toggle', disabled && 'disabled')
              }
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
              return this.renderRole(item.role, item.label, item.maxCardinality);
            }, this)
          }
        </div>
      </div>
    );
  },
  renderIndividu: function(id) {
    var editedEntity = this.props.editedEntity;
    var disabled = !! editedEntity;
    var edited = editedEntity && editedEntity.id === id;
    return (
      <Individu
        disabled={disabled}
        edited={edited}
        errors={this.forIndividu(id, 'errors')}
        id={id}
        key={id}
        onDelete={this.props.onDeleteIndividu}
        onEdit={this.props.onEdit}
        onMove={this.props.onMoveIndividu}
        suggestions={this.forIndividu(id, 'suggestions')}
        value={this.props.individus[id]}
      />
    );
  },
  renderRole: function(role, label, maxCardinality) {
    var individus;
    var roleData = this.props.value[role];
    if (roleData) {
      if (maxCardinality === 1) {
        individus = this.renderIndividu(roleData);
      } else {
        individus = roleData.map(function(id) {
          return this.renderIndividu(id);
        }, this);
      }
    }
    var disabled = !! this.props.editedEntity;
    var addLink = (
      ! disabled && (
        ! roleData ||
        maxCardinality === 1 && roleData ||
        maxCardinality > 1 && roleData.length < maxCardinality
      )
    ) ? (
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
