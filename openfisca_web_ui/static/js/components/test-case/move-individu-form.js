/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var EntityRoleSelect = require('./entity-role-select'),
  testCases = require('../../test-cases');


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
  render() {
    return (
      <div>
        {
          this.props.getEntitiesKinds(this.props.entitiesMetadata, {persons: false}).map((kind) => {
            var entityMetadata = this.props.entitiesMetadata[kind];
            var entities = Lazy(this.props.testCase[kind]).map((entity) => {
              return {
                id: entity.id,
                label: this.props.getEntityLabel(kind, entity, this.props.entitiesMetadata),
              };
            }).sortBy('label').toArray();
            var roles = entityMetadata.roles.map((role) => ({
              isFull: testCases.isSingleton(kind, role, this.props.entitiesMetadata) &&
                testCases.findEntity(kind, this.props.currentEntityIdByKind[kind], this.props.testCase)[role] !== null,
              label: this.props.entitiesMetadata[kind].labelByRoleKey[role],
              value: role,
            }));
            return (
              <EntityRoleSelect
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
