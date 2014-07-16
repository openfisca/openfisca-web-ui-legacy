/** @jsx React.DOM */
'use strict';

var getObjectPath = require('get-object-path'),
  invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react');

var Entity = require('./entity'),
  Individu = require('./individu'),
  Role = require('./role');


var TestCase = React.createClass({
  propTypes: {
    entitiesMetadata: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    frozenEntity: React.PropTypes.object,
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
    var kinds = Object.keys(entitiesMetadata);
    return (
      <div>
        {
          kinds.map(function(kind) {
            if (this.props.testCase[kind]) {
              return Lazy(this.props.testCase[kind])
                .map(function(entity, entityId) {
                  return Lazy(entity).assign({
                    id: entityId,
                    label: this.props.getEntityLabel(kind, entity),
                  }).toObject();
                }.bind(this))
                .sortBy('label')
                .map(function(entity) {
                  var disabled =  !! this.props.frozenEntity;
                  return (
                    <Entity
                      disabled={disabled}
                      hasErrors={ !! getObjectPath(this.props.errors, kind + '.' + entity.id)}
                      isEdited={ !! (this.props.frozenEntity && this.props.frozenEntity.id === entity.id)}
                      key={entity.id}
                      label={entity.label}
                      onDelete={this.props.onDeleteEntity.bind(null, kind, entity.id)}
                      onEdit={this.props.onEditEntity.bind(null, kind, entity.id)}>
                      {
                        entitiesMetadata[kind].roles.map(function(role) {
                          var maxCardinality = entitiesMetadata[kind].maxCardinality[role];
                          var renderIndividu = function(individuId) {
                            invariant(individuId in this.props.testCase.individus,
                              'individuId is not in testCase.individus');
                            return (
                              <Individu
                                disabled={disabled}
                                edited={ !! (this.props.frozenEntity && this.props.frozenEntity.id === individuId)}
                                errors={getObjectPath(this.props.errors, 'individus.' + individuId)}
                                id={individuId}
                                key={individuId}
                                onDelete={this.props.onDeleteIndividu.bind(null, individuId)}
                                onEdit={this.props.onEditEntity.bind(null, 'individus', individuId)}
                                onMove={this.props.onMoveIndividu.bind(null, individuId)}
                                suggestions={getObjectPath(this.props.suggestions, 'individus.' + individuId)}
                                value={this.props.testCase.individus[individuId]}
                              />
                            );
                          }.bind(this);
                          var error = getObjectPath(this.props.errors, kind + '.' + entity.id + '.' + role);
                          if (typeof(error) === 'object') {
                            error = Lazy(error).values().join(', ');
                          }
                          return (
                            <Role
                              disabled={disabled}
                              error={error}
                              key={role}
                              label={this.props.roleLabels[role]}
                              maxCardinality={maxCardinality}
                              onCreateIndividuInEntity={
                                this.props.onCreateIndividuInEntity.bind(null, kind, entity.id, role)
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
                }.bind(this)).toArray();
            }
          }, this)
        }
      </div>
    );
  },
});

module.exports = TestCase;
