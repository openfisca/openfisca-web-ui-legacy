/** @jsx React.DOM */
'use strict';

var mapObject = require('map-object'),
  React = require('react');

var Entity = require('./entity'),
  models = require('../models');


var TestCaseForm = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,
    errors: React.PropTypes.object,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    onDeleteEntity: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEditEntity: React.PropTypes.func.isRequired,
    onMoveIndividu: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    testCase: React.PropTypes.object.isRequired,
  },
  forEntity: function(kind, id, key) {
    return this.props[key] && this.props[key][kind] ? this.props[key][kind][id] : null;
  },
  render: function() {
    var kinds = Object.keys(models.entitiesMetadata);
    var entities = {};
    kinds.forEach(function(kind) {
      entities[kind] = kind in this.props.testCase && this.props.testCase[kind] ?
        mapObject(this.props.testCase[kind], function(entity, id) {
          return this.renderEntity(entity, kind, id);
        }, this)
        : null;
    }, this);
    return (
      <div>
        {
          this.props.errors && this.props.errors.individus ?
            <p className="text-danger">Individus : {this.props.errors.individus}</p>
            : null
        }
        {entities.familles}
        {entities.foyers_fiscaux /* jshint ignore:line */}
        {entities.menages}
      </div>
    );
  },
  renderEntity: function(entity, kind, id) {
    return <Entity
      disabled={this.props.disabled}
      errors={this.forEntity(kind, id, 'errors')}
      id={id}
      individus={this.props.testCase.individus}
      key={id}
      kind={kind}
      label={models.TestCase.getEntityLabel(kind, entity)}
      onCreateIndividuInEntity={this.props.onCreateIndividuInEntity}
      onDelete={this.props.onDeleteEntity}
      onDeleteIndividu={this.props.onDeleteIndividu}
      onEdit={this.props.onEditEntity}
      onMoveIndividu={this.props.onMoveIndividu}
      roles={
        models.entitiesMetadata[kind].roles.map(function(role) {
          return {
            label: models.roleLabels[role],
            maxCardinality: models.entitiesMetadata[kind].maxCardinality[role],
            role: role,
          };
       })
      }
      suggestions={this.forEntity(kind, id, 'suggestions')}
      value={entity}
    />;
  },
});

module.exports = TestCaseForm;
