/** @jsx React.DOM */
'use strict';

var mapObject = require('map-object'),
  React = require('react');

var Entity = require('./entity'),
  models = require('../models');


var TestCaseForm = React.createClass({
  propTypes: {
    errors: React.PropTypes.object,
    onAddIndividuInEntity: React.PropTypes.func.isRequired,
    onDeleteEntity: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEditEntity: React.PropTypes.func.isRequired,
    onEditIndividu: React.PropTypes.func.isRequired,
    onMoveIndividu: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    testCase: React.PropTypes.object.isRequired,
  },
  createEntity: function(entity, kind, id) {
    return <Entity
      errors={/*this.props.errors[id]*/null}
      id={id}
      individuIdsByRole={entity}
      individus={this.props.testCase.individus}
      key={id}
      kind={kind}
      onAddIndividuInEntity={this.props.onAddIndividuInEntity}
      onDelete={this.props.onDeleteEntity}
      onDeleteIndividu={this.props.onDeleteIndividu}
      onEdit={this.props.onEditEntity}
      onEditIndividu={this.props.onEditIndividu}
      onMoveIndividu={this.props.onMoveIndividu}
      suggestions={this.props.suggestions[id]}
    />;
  },
  render: function() {
    var kinds = Object.keys(models.entitiesMetadata);
    var entities = {};
    kinds.forEach(function(kind) {
      entities[kind] =
        kind in this.props.testCase ?
          mapObject(this.props.testCase[kind], function(entity, id) {
            return this.createEntity(entity, kind, id);
          }, this) : null;
    }, this);
    return (
      <div>
        {entities.familles}
        {entities.foyers_fiscaux /* jshint ignore:line */}
        {entities.menages}
      </div>
    );
  }
});

module.exports = TestCaseForm;
