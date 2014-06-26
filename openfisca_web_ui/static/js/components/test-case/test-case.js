/** @jsx React.DOM */
'use strict';

var getObjectPath = require('get-object-path'),
  mapObject = require('map-object'),
  React = require('react');

var Entity = require('./entity'),
  Individu = require('./individu'),
  Role = require('./role');


var TestCase = React.createClass({
  propTypes: {
    editedEntity: React.PropTypes.object,
    entitiesMetadata: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    getEntityLabel: React.PropTypes.func.isRequired,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    onDeleteEntity: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEditEntity: React.PropTypes.func.isRequired,
    onMoveIndividu: React.PropTypes.func.isRequired,
    roleLabels: React.PropTypes.object.isRequired,
    suggestions: React.PropTypes.object,
    testCase: React.PropTypes.object.isRequired,
  },
  render: function() {
    var entitiesMetadata = this.props.entitiesMetadata;
    return (
      <div>
        {
          Object.keys(entitiesMetadata).map(function(kind) {
            if (this.props.testCase[kind]) {
              return mapObject(this.props.testCase[kind], function(entity, entityId) {
                var disabled =  !! this.props.editedEntity;
                return (
                  <Entity
                    disabled={disabled}
                    hasErrors={ !! getObjectPath(this.props.errors, kind + '.' + entityId)}
                    id={entityId}
                    isEdited={ !! (this.props.editedEntity && this.props.editedEntity.id === entityId)}
                    key={entityId}
                    kind={kind}
                    label={this.props.getEntityLabel(kind, entity)}
                    onDelete={this.props.onDeleteEntity}
                    onEdit={this.props.onEditEntity}>
                    {
                      entitiesMetadata[kind].roles.map(function(role) {
                        var maxCardinality = entitiesMetadata[kind].maxCardinality[role];
                        var renderIndividu = function(individuId) {
                          return (
                            <Individu
                              disabled={disabled}
                              edited={ !! (this.props.editedEntity && this.props.editedEntity.id === individuId)}
                              errors={getObjectPath(this.props.errors, 'individus.' + individuId)}
                              id={individuId}
                              key={individuId}
                              onDelete={this.props.onDeleteIndividu}
                              onEdit={this.props.onEditEntity}
                              onMove={this.props.onMoveIndividu}
                              suggestions={getObjectPath(this.props.suggestions, 'individus.' + individuId)}
                              value={this.props.testCase.individus[individuId]}
                            />
                          );
                        }.bind(this);
                        return (
                          <Role
                            disabled={disabled}
                            error={getObjectPath(this.props.errors, kind + '.' + entityId + '.' + role)}
                            key={role}
                            label={this.props.roleLabels[role]}
                            maxCardinality={maxCardinality}
                            onCreateIndividuInEntity={
                              this.props.onCreateIndividuInEntity.bind(null, kind, entityId, role)
                            }
                            role={role}>
                            {
                              entity[role] && (
                                maxCardinality === 1 ?
                                  renderIndividu(entity[role]) :
                                  entity[role].map(renderIndividu)
                                )
                            }
                          </Role>
                        );
                     }, this)
                    }
                  </Entity>
                );
              }, this);
            }
          }, this)
        }
      </div>
    );
  },
});

module.exports = TestCase;
