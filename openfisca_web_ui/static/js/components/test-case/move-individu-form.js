/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var EntityRoleSelector = require('./entity-role-selector');


var MoveIndividuForm = React.createClass({
  propTypes: {
    currentEntityIdByKind: React.PropTypes.object.isRequired,
    entitiesMetadata: React.PropTypes.object.isRequired,
    getEntityLabel: React.PropTypes.func.isRequired,
    onEntityChange: React.PropTypes.func.isRequired,
    onRoleChange: React.PropTypes.func.isRequired,
    roleLabels: React.PropTypes.object.isRequired,
    testCase: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <div>
        {
          Lazy(this.props.entitiesMetadata).map(function(entityMetadata, kind) {
            var entities = Lazy(this.props.testCase[kind]).map(function(entity, entityId) {
              return {
                id: entityId,
                label: this.props.getEntityLabel(kind, entity),
              };
            }.bind(this)).sortBy('label').toArray();
            var roles = entityMetadata.roles.map(function(role) {
              return {
                id: role,
                label: this.props.roleLabels[role],
              };
            }, this);
            return (
              <EntityRoleSelector
                currentEntityId={this.props.currentEntityIdByKind[kind]}
                entities={entities}
                key={kind}
                kind={kind}
                label={entityMetadata.label}
                onEntityChange={this.props.onEntityChange.bind(null, kind)}
                onRoleChange={this.props.onRoleChange.bind(null, kind)}
                roles={roles}
              />
            );
          }.bind(this)).toArray()
        }
      </div>
    );
  }
});

module.exports = MoveIndividuForm;
