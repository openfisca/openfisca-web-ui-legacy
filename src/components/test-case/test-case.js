import {Component} from 'react'

var Entity = require('./entity'),
  helpers = require('../../helpers'),
  Individu = require('./individu'),
  Role = require('./role'),
  testCases = require('../../test-cases');

export default class TestCase extends Component {
  propTypes: {
    activeEntityId: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    entitiesMetadata: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    getEntitiesKinds: React.PropTypes.func.isRequired,
    onCloseEntity: React.PropTypes.func.isRequired,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    onDeleteEntity: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEditEntity: React.PropTypes.func,
    onMoveIndividu: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    testCase: React.PropTypes.object.isRequired,
  }
  handleEdit(kind, id) {
    if (id === this.props.activeEntityId) {
      this.props.onCloseEntity();
    } else if (this.props.onEditEntity) {
      this.props.onEditEntity(kind, id);
    }
  }
  render() {
    var kinds = this.props.getEntitiesKinds(this.props.entitiesMetadata, {persons: false});
    return (
      <div className='test-case'>
        {
          kinds.map((kind) => {
            if (this.props.testCase[kind]) {
              return this.props.testCase[kind].map((entity, entityIdx) =>
                <Entity
                  active={this.props.activeEntityId === entity.id}
                  disabled={this.props.disabled}
                  hasErrors={Boolean(helpers.getObjectPath(this.props.errors, kind, String(entityIdx)))}
                  id={entity.id}
                  key={entity.id}
                  onDelete={() => this.props.onDeleteEntity(kind, entity.id)}
                  onEdit={() => this.handleEdit(kind, entity.id)}
                >
                  {
                    this.props.entitiesMetadata[kind].roles.map(role => {
                      var maxCardinality = this.props.entitiesMetadata[kind].maxCardinalityByRoleKey[role];
                      var renderIndividu = (individuId, individuIdx) => {
                        var individu = testCases.findEntity('individus', individuId, this.props.testCase);
                        return (
                          <Individu
                            active={this.props.activeEntityId === individuId}
                            disabled={this.props.disabled}
                            errors={helpers.getObjectPath(this.props.errors, 'individus', String(individuIdx))}
                            id={individuId}
                            key={individuId}
                            onDelete={this.props.onDeleteIndividu.bind(null, individuId)}
                            onEdit={this.handleEdit.bind(null, 'individus', individuId)}
                            onMove={this.props.onMoveIndividu.bind(null, individuId)}
                            suggestions={helpers.getObjectPath(this.props.suggestions, 'individus', individuId)}
                          />
                        );
                      };
                      var error = helpers.getObjectPath(this.props.errors, kind, String(entityIdx), role);
                      if (typeof(error) === 'object') {
                        error = Lazy(error).values().join(', ');
                      }
                      return (
                        <Role
                          disabled={this.props.disabled}
                          error={error}
                          key={role}
                          label={this.props.entitiesMetadata[kind].labelByRoleKey[role]}
                          maxCardinality={maxCardinality}
                          onCreateIndividuInEntity={
                            this.props.onCreateIndividuInEntity.bind(null, kind, entity.id, role)
                          }
                          role={role}
                        >
                          {
                            entity[role] && (
                              maxCardinality === 1 ? renderIndividu(entity[role], 0) : entity[role].map(renderIndividu)
                            )
                          }
                        </Role>
                      );
                   })
                  }
                </Entity>
              );
            }
          })
        }
      </div>
    );
  }
}
