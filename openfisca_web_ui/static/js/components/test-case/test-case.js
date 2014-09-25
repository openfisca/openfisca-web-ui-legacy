/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react'),
  ReactIntlMixin = require('react-intl');

var Entity = require('./entity'),
  helpers = require('../../helpers'),
  Individu = require('./individu'),
  Role = require('./role');


var TestCase = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    activeEntityId: React.PropTypes.string,
    entitiesMetadata: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    getEntitiesKinds: React.PropTypes.func.isRequired,
    getEntityLabel: React.PropTypes.func.isRequired,
    onCloseEntity: React.PropTypes.func.isRequired,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    onDeleteEntity: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEditEntity: React.PropTypes.func,
    onMoveIndividu: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    testCase: React.PropTypes.object.isRequired,
  },
  handleEdit: function(kind, id) {
    if (id === this.props.activeEntityId) {
      this.props.onCloseEntity();
    } else {
      this.props.onEditEntity && this.props.onEditEntity(kind, id);
    }
  },
  render: function() {
    var kinds = this.props.getEntitiesKinds(this.props.entitiesMetadata, {persons: false});
    return (
      <div>
        {
          kinds.map(kind => {
            if (this.props.testCase[kind]) {
              return Lazy(this.props.testCase[kind])
                .map((entity, entityId) => Lazy(entity).assign({
                  id: entityId,
                  label: this.props.getEntityLabel(kind, entity, this.props.entitiesMetadata),
                }).toObject())
                .sortBy('label')
                .map(entity =>
                  <Entity
                    active={this.props.activeEntityId === entity.id}
                    hasErrors={ !! helpers.getObjectPath(this.props.errors, kind, entity.id)}
                    key={entity.id}
                    label={entity.label}
                    onDelete={this.props.onDeleteEntity.bind(null, kind, entity.id)}
                    onEdit={this.handleEdit.bind(null, kind, entity.id)}>
                    {
                      this.props.entitiesMetadata[kind].roles.map(role => {
                        var maxCardinality = this.props.entitiesMetadata[kind].maxCardinalityByRoleKey[role];
                        var renderIndividu = individuId => {
                          invariant(individuId in this.props.testCase.individus,
                            'individuId is not in testCase.individus');
                          return (
                            <Individu
                              active={this.props.activeEntityId === individuId}
                              errors={helpers.getObjectPath(this.props.errors, 'individus', individuId)}
                              id={individuId}
                              key={individuId}
                              name={
                                this.props.testCase.individus[individuId][
                                  this.props.entitiesMetadata.individus.nameKey
                                ]
                              }
                              onDelete={this.props.onDeleteIndividu.bind(null, individuId)}
                              onEdit={this.handleEdit.bind(null, 'individus', individuId)}
                              onMove={this.props.onMoveIndividu.bind(null, individuId)}
                              suggestions={helpers.getObjectPath(this.props.suggestions, 'individus', individuId)}
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
                            label={this.props.entitiesMetadata[kind].labelByRoleKey[role]}
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
                    <a href='#' onClick={event => { event.preventDefault(); this.props.onCreateEntity(kind); }}>
                      {this.getIntlMessage(`addEntity:${kind}`)}
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
