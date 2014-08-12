/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react');

var Entity = require('./entity'),
  helpers = require('../../helpers'),
  Individu = require('./individu'),
  Role = require('./role');


var TestCase = React.createClass({
  propTypes: {
    activeEntityId: React.PropTypes.string,
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
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    var entitiesMetadata = this.props.entitiesMetadata;
    var kinds = Object.keys(entitiesMetadata);
    return (
      <div>
        {
          kinds.map(kind => {
            if (this.props.testCase[kind]) {
              return Lazy(this.props.testCase[kind])
                .map((entity, entityId) => Lazy(entity).assign({
                  id: entityId,
                  label: this.props.getEntityLabel(kind, entity),
                }).toObject())
                .sortBy('label')
                .map(entity =>
                  <Entity
                    active={this.props.activeEntityId === entity.id}
                    hasErrors={ !! helpers.getObjectPath(this.props.errors, kind, entity.id)}
                    key={entity.id}
                    label={entity.label}
                    onDelete={this.props.onDeleteEntity.bind(null, kind, entity.id)}
                    onEdit={this.props.onEditEntity.bind(null, kind, entity.id)}>
                    {
                      entitiesMetadata[kind].roles.map(role => {
                        var maxCardinality = entitiesMetadata[kind].maxCardinality[role];
                        var renderIndividu = individuId => {
                          invariant(individuId in this.props.testCase.individus,
                            'individuId is not in testCase.individus');
                          return (
                            <Individu
                              active={this.props.activeEntityId === individuId}
                              errors={helpers.getObjectPath(this.props.errors, 'individus', individuId)}
                              id={individuId}
                              key={individuId}
                              onDelete={this.props.onDeleteIndividu.bind(null, individuId)}
                              onEdit={this.props.onEditEntity.bind(null, 'individus', individuId)}
                              onMove={this.props.onMoveIndividu.bind(null, individuId)}
                              suggestions={helpers.getObjectPath(this.props.suggestions, 'individus', individuId)}
                              value={this.props.testCase.individus[individuId]}
                            />
                          );
                        };
                        var error = helpers.getObjectPath(this.props.errors, kind, entity.id, role);
                        if (typeof(error) === 'object') {
                          error = Lazy(error).values().join(', ');
                        }
                        return (
                          <Role
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
                                maxCardinality === 1 ? renderIndividu(entity[role]) : entity[role].map(renderIndividu)
                              )
                            }
                          </Role>
                        );
                     })
                    }
                  </Entity>
                )
                .concat(
                  <p style={{marginBottom: 20}}>
                    <a
                      href='#'
                      onClick={
                        this.preventDefaultThen.bind(null, this.props.onCreateEntity.bind(null, kind))
                      }>
                      {entitiesMetadata[kind].createMessage}
                    </a>
                  </p>
                )
                .toArray();
            }
          })
        }
      </div>
    );
  },
});

module.exports = TestCase;
