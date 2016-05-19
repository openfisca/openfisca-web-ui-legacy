import {Component} from 'react'

var EntityRoleSelect = require('./entity-role-select'),
  testCases = require('../../test-cases');


export default class MoveIndividuForm extends Component {
  propTypes: {
    currentEntityIdByKind: React.PropTypes.object.isRequired,
    currentRoleByKind: React.PropTypes.object.isRequired,
    entitiesMetadata: React.PropTypes.object.isRequired,
    getEntitiesKinds: React.PropTypes.func.isRequired,
    onEntityChange: React.PropTypes.func.isRequired,
    onRoleChange: React.PropTypes.func.isRequired,
    testCase: React.PropTypes.object.isRequired,
  }
  render() {
    return (
      <div>
        {
          this.props.getEntitiesKinds(this.props.entitiesMetadata, {persons: false}).map((kind) => {
            var entityMetadata = this.props.entitiesMetadata[kind];
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
                entityIds={this.props.testCase[kind].map(entity => entity.id)}
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
}
