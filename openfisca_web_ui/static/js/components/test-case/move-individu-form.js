/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var EntityRoleSelector = require('./entity-role-selector');


var MoveIndividuForm = React.createClass({
  propTypes: {
    currentEntityIdByKind: React.PropTypes.object.isRequired,
    currentRoleByKind: React.PropTypes.object.isRequired,
    entitiesMetadata: React.PropTypes.object.isRequired,
    getEntitiesKinds: React.PropTypes.func.isRequired,
    getEntityLabel: React.PropTypes.func.isRequired,
    onEntityChange: React.PropTypes.func.isRequired,
    onRoleChange: React.PropTypes.func.isRequired,
    testCase: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <div>
        {
          this.props.getEntitiesKinds(this.props.entitiesMetadata, {persons: false}).map(kind => {
            var entityMetadata = this.props.entitiesMetadata[kind];
            var entities = Lazy(this.props.testCase[kind]).map((entity, entityId) => {
              return {
                id: entityId,
                label: this.props.getEntityLabel(kind, entity, this.props.entitiesMetadata),
              };
            }).sortBy('label').toArray();
            var roles = entityMetadata.roles.map(role => ({
              id: role,
              label: this.props.entitiesMetadata[kind].labelByRoleKey[role],
            }));
            return (
              <EntityRoleSelector
                currentEntityId={this.props.currentEntityIdByKind[kind]}
                currentRole={this.props.currentRoleByKind[kind]}
                entities={entities}
                key={kind}
                kind={kind}
                label={entityMetadata.label}
                onEntityChange={this.props.onEntityChange.bind(null, kind)}
                onRoleChange={this.props.onRoleChange.bind(null, kind)}
                roles={roles}
              />
            );
          })
        }
      </div>
    );
  }
});

module.exports = MoveIndividuForm;
