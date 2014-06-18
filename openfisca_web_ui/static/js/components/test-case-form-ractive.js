'use strict';

var $ = require('jquery'),
  Q = require('q'),
  Ractive = require('ractive'),
  _ = require('underscore');

var chartsM = require('../models/chartsM'),
  situationFormT = require('rv!situationFormT');

var appconfig = global.appconfig;


if ( ! ('situationForm' in appconfig.enabledModules)) {
  return;
}

var guid = (function() {
  function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
  return function() { return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4(); };
})();


var SituationForm = Ractive.extend({
  data: {
    _: _,
    defaultLabel: function(column) {
      function booleanToString(value) { return value ? 'Oui' : 'Non'; }
      switch (column['@type']) {
        case 'Boolean':
          if (_.isUndefined(column.suggestion)) {
            return 'valeur par défaut : ' + booleanToString(column.default); // jshint ignore:line
          } else {
            return 'valeur suggérée : ' + booleanToString(column.suggestion); // jshint ignore:line
          }
          break;
        case 'Enumeration':
          if (_.isUndefined(column.suggestion)) {
            return 'valeur par défaut : ' + column.labels[column.default]; // jshint ignore:line
          } else {
            return 'valeur suggérée : ' + column.labels[column.suggestion]; // jshint ignore:line
          }
          break;
      }
      return null;
    },
    entityLabel: function(entityKey, entityId) {
      var noun = {
        familles: 'Famille',
        foyers_fiscaux: 'Déclaration d\'impôt', // jshint ignore:line
        individus: '',
        menages: 'Ménage',
      }[entityKey];
      var entityNameKey = {
        familles: 'nom_famille',
        foyers_fiscaux: 'nom_foyer_fiscal', // jshint ignore:line
        individus: 'nom_individu',
        menages: 'nom_menage',
      }[entityKey];
      var name = this.get(['testCase', entityKey, entityId, entityNameKey].join('.'));
      var label = noun;
      if (name) {
        label += ' ' + name;
      }
      return label;
    },
    categories: function(entityKey, entityId, errors, suggestions) {
      // Create an entity with categories, columns, errors and suggestions.
      if (_.isUndefined(entityKey)) {
        return [];
      }
      errors = errors || {};
      suggestions = suggestions || {};
      var entity = this.get(['testCase', entityKey, entityId].join('.'));
      var enrichColumn = function(columnName) {
        var column = _.clone(this.get('columns.' + columnName));
        column.value = columnName in entity ? entity[columnName] : '';
        var entityErrors = (errors[entityKey] || {})[entityId];
        if ( ! _.isUndefined(entityErrors) && columnName in entityErrors) {
          column.error = errors[entityKey][entityId][columnName];
        }
        var entitySuggestions = (suggestions[entityKey] || {})[entityId];
        if ( ! _.isUndefined(entitySuggestions) && columnName in entitySuggestions) {
          column.suggestion = suggestions[entityKey][entityId][columnName];
        }
        return column;
      }.bind(this);
      var categories = _.map(this.get('columnsTree.' + entityKey + '.children'), function(category) {
        var columns = _.map(category.children, enrichColumn);
        var hasKey = function(key) {
          return _(columns).chain().pluck(key).reject(_.isUndefined).value().length > 0;
        };
        return {
          columns: columns,
          hasErrors: hasKey('error'),
          hasSuggestions: hasKey('suggestion'),
          label: category.label,
        };
      });
      return categories;
    },
    withLinkedObjects: function(entityKey, entities, errors, suggestions) {
      // Resolve links and return a unique object containing the entities with its "individus" (instead of IDs),
      // errors and suggestions at the right imbrication level.
      errors = errors || {};
      suggestions = suggestions || {};
      var individuData = function(individuId) {
        return {
          entityId: individuId,
          hasErrors: !! (errors.individus || {})[individuId],
          hasSuggestions: !! (suggestions.individus || {})[individuId],
          label: this.get('testCase.individus.' + individuId + '.nom_individu'),
        };
      }.bind(this);
      var entitiesWithLinkedObjects = _(entities).chain().map(function(entity, entityId) {
        var newEntity = this.createEntity(entityKey);
        var individualHasErrors = false;
        var setErrors = function(newEntityRole, roleKey) {
          var newEntityRoleErrors = (((errors || {})[entityKey] || {})[entityId] || {})[roleKey];
          if (_.isString(newEntityRoleErrors)) {
            newEntityRole.error = newEntityRoleErrors;
          } else if (_.isObject(newEntityRoleErrors)) {
            // Add role specific error.
            _.each(newEntityRoleErrors, function(error, individuIdx) {
              newEntityRole.individus[individuIdx].roleError = error;
            });
          }
        };
        // Add "individus".
        if ('lists' in entitiesMetadata[entityKey]) {
          _.each(entitiesMetadata[entityKey].lists, function(roleKey) {
            var individus = _.map(entity[roleKey], individuData, this);
            if ( ! individualHasErrors) {
              individualHasErrors = _(individus).chain()
                .map(function(individu) { return individu.hasErrors; }).some().value();
            }
            var newEntityRole = {individus: individus};
            setErrors(newEntityRole, roleKey);
            newEntity[roleKey] = newEntityRole;
          }, this);
        }
        if ('singletons' in entitiesMetadata[entityKey]) {
          _.each(entitiesMetadata[entityKey].singletons, function(roleKey) {
            var individuId = entity[roleKey];
            var newEntityRole;
            if (_.isUndefined(individuId)) {
              newEntityRole = {individu: null};
            } else {
              var individu = individuData(individuId);
              if ( ! individualHasErrors) {
                individualHasErrors = individu.hasErrors;
              }
              newEntityRole = {individu: individu};
            }
            setErrors(newEntityRole, roleKey);
            newEntity[roleKey] = newEntityRole;
          }, this);
        }
        // Entity has errors if it has errors itself or at least one of its individuals has an error.
        newEntity.hasErrors = !! ((errors || {})[entityKey] || {})[entityId] || individualHasErrors;
        newEntity.hasSuggestions = !! ((suggestions || {})[entityKey] || {})[entityId];
        return [entityId, newEntity];
      }, this).object().value();
      return entitiesWithLinkedObjects;
    },
  },
  template: situationFormT,

  init: function() {
    this.fetchFieldsAsync().catch(function() {
      this.set('status', {message: null, type: 'error'});
      alert('Impossible de charger les questions du simulateur.');
    }.bind(this))
    .done();
    this.initEvents();
  },

  // Event methods
  initEvents: function() {
    var simulateAsync = function() {
      return Q(this.set('simulateInProgress', true))
      .then(function() { return chartsM.simulateAsync(this.get('testCaseForAPI')); }.bind(this))
      .then(function() { return this.set('simulateInProgress', false); }.bind(this));
    }.bind(this);
    var repairSaveSimulateAsync = function() {
      return Q.fcall(function() { return this.repairTestCaseAsync(); }.bind(this))
      .then(function() { this.saveTestCaseAsync(); }.bind(this))
      .then(simulateAsync);
    }.bind(this);
    this.on({
      addEntity: function(event, entityKey) {
        event.original.preventDefault();
        this.addEntityAsync(entityKey)
        .then(function() { return repairSaveSimulateAsync(); })
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .done();
      },
      addIndividu: function(event, entityKey, roleKey) {
        event.original.preventDefault();
        this.addIndividuAsync(entityKey, event.index.entityId, roleKey)
        .then(function() { return repairSaveSimulateAsync(); })
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .done();
      },
      move: function(event) {
        event.original.preventDefault();
        Q.all([
          this.moveToEntityAsync(event.context.individuId, 'familles', event.context.famille.id,
            event.context.famille.roleKey),
          this.moveToEntityAsync(event.context.individuId, 'foyers_fiscaux', event.context.foyerFiscal.id,
            event.context.foyerFiscal.roleKey),
          this.moveToEntityAsync(event.context.individuId, 'menages', event.context.menage.id,
            event.context.menage.roleKey),
        ])
        .then(function() { return repairSaveSimulateAsync(); })
        .then(function() { $(this.find('#move-modal')).modal('hide'); }.bind(this))
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .done();
      },
      repairTestCase: function(event) {
        event.original.preventDefault();
        return repairSaveSimulateAsync()
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .done();
      },
      saveEntity: function(event, entityKey) {
        event.original.preventDefault();
        var extractValues = function(categories) {
          return _(categories).chain()
            .map(function(category) {
              return _(category.columns).chain()
                .reject(function(column) { return column.value === ''; })
                .map(function(column) { return [column.name, column.value]; })
                .value();
            })
            .flatten(true)
            .object().value();
        };
        var entityKeypath = ['testCase', entityKey, event.context.entityId].join('.');
        var newEntity = extractValues(event.context.categories);
        if (entityKey !== 'individus') {
          var entityRoles = _.extend(entitiesMetadata[entityKey].lists, entitiesMetadata[entityKey].singletons);
          var roleValues = _.pick(this.get(entityKeypath), entityRoles);
          _.extend(newEntity, roleValues);
          
        }
        Q.fcall(function() { $(this.find('#edit-modal')).modal('hide'); }.bind(this))
        .then(function() { return this.set('modal', null); }.bind(this))
        .then(function() { return this.set(entityKeypath, newEntity); }.bind(this))
        .then(function() { return repairSaveSimulateAsync(); })
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .done();
      },
      showEditModal: function(event, entityKey, entityId) {
        event.original.preventDefault();
        Q.fcall(function() {
          return this.set('modal', {
            entityId: entityId,
            entityKey: entityKey,
            type: 'edit',
          });
        }.bind(this))
        .then(function() { $(this.find('#edit-modal')).modal('show'); }.bind(this))
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .done();
      },
      showMoveModal: function(event) {
        event.original.preventDefault();
        var individuId = event.context.entityId;
        Q(this.set('modal', {
          famille: this.findEntityInfos(individuId, 'familles') || {roleKey: 'parents'},
          foyerFiscal: this.findEntityInfos(individuId, 'foyers_fiscaux') || {roleKey: 'declarants'}, // jshint ignore:line
          individuId: individuId,
          menage: this.findEntityInfos(individuId, 'menages') || {roleKey: 'personne_de_reference'},
          type: 'move',
        }))
        .then(function() {
          $(this.find('#move-modal')).modal('show');
        }.bind(this))
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .done();
      },
      simulate: function(event) {
        event.original.preventDefault();
        return simulateAsync()
        .catch(function(error) {
          console.error(error);
          window.location.reload();
        }.bind(this))
        .done();
      },
    });
  },

  // Data methods
  addEntityAsync: function(entityKey) {
    var newEntityId = guid();
    var newEntity = this.createEntity(entityKey);
    return Q(this.set(['testCase', entityKey, newEntityId].join('.'), newEntity));
  },
  addIndividuAsync: function(entityKey, entityId, roleKey) {
    var guessNextIndividuName = function() {
      var prefix = 'Personne ';
      var values = _(this.get('testCase.individus')).chain()
        .map(function(individu) {
          if (individu.nom_individu && individu.nom_individu.indexOf(prefix) === 0) { // jshint ignore:line
            return parseInt(individu.nom_individu.slice(prefix.length, individu.nom_individu.length)); // jshint ignore:line
          }
        })
        .reject(_.isUndefined)
      .value();
      var maxValue = values.length ? Math.max.apply(null, values) : 0;
      return prefix + (maxValue + 1);
    }.bind(this);
    var newIndividuId = guid();
    return Q(this.set('testCase.individus.' + newIndividuId, {
      id: newIndividuId,
      nom_individu: guessNextIndividuName(), // jshint ignore:line
    }))
    .then(function() { return this.addToEntityAsync(newIndividuId, entityKey, entityId, roleKey); }.bind(this));
  },
  addToEntityAsync: function(individuId, entityKey, entityId, roleKey) {
    var entityRoleKey = ['testCase', entityKey, entityId, roleKey].join('.');
    var entityRoleIndividus = this.get(entityRoleKey);
    var promise = Q();
    if (_.contains(entitiesMetadata[entityKey].lists, roleKey)) {
      if (_.isUndefined(entityRoleIndividus)) {
        entityRoleIndividus = [];
        promise = promise.then(function() { return Q(this.set(entityRoleKey, entityRoleIndividus)); }.bind(this));
      }
      entityRoleIndividus.push(individuId);
      promise = promise.then(function() { return this.repairTestCaseAsync(); }.bind(this));
    } else if ( ! this.get(entityRoleKey)) {
      // Assume roleKey is in singletons.
      promise = promise.then(function() { return Q(this.set(entityRoleKey, individuId)); }.bind(this))
      .then(function() { return this.repairTestCaseAsync(); }.bind(this));
    }
    return promise;
  },
  deleteEntityAsync: function(entityKey, entityId) {
    var entityKeypath = 'testCase.' + entityKey;
    return Q(this.set(entityKeypath, _.omit(this.get(entityKeypath), entityId)));
  },
  detachFromEntityAsync: function(individuId, entityKey) {
    var individuEntityInfos = this.findEntityInfos(individuId, entityKey);
    if (individuEntityInfos !== null) {
      var individuKeypath = ['testCase', entityKey, individuEntityInfos.id, individuEntityInfos.roleKey].join('.');
      if (individuEntityInfos.cardinality === 'list') {
        return Q(this.set(individuKeypath, _.without(this.get(individuKeypath), individuId)));
      } else {
        // cardinality === 'singleton'
        return Q(this.set(individuKeypath, null));
      }
    }
    return Q();
  },
  findEntityInfos: function(individuId, entityKey) {
    var entityInfos = null;
    _.each(this.get('testCase.' + entityKey), function(entity, entityId) {
      _.each(entitiesMetadata, function(entityData) {
        _.each(entityData.lists, function(roleKey) {
          if (_.contains(entity[roleKey], individuId)) {
            entityInfos = {cardinality: 'list', id: entityId, roleKey: roleKey};
          }
        }, this);
        _.each(entityData.singletons, function(roleKey) {
          if (entity[roleKey] === individuId) {
            entityInfos = {cardinality: 'singleton', id: entityId, roleKey: roleKey};
          }
        }, this);
      }, this);
    }, this);
    return entityInfos;
  },
  moveToEntityAsync: function(individuId, entityKey, entityId, roleKey) {
    var entityRoleIndividuIds = this.get(['testCase', entityKey, entityId, roleKey].join('.'));
    if ( ! _.contains(entityRoleIndividuIds, individuId)) {
      return this.detachFromEntityAsync(individuId, entityKey)
      .then(function() { this.addToEntityAsync(individuId, entityKey, entityId, roleKey); }.bind(this));
    }
  },

  // Webservices methods
  fetchFieldsAsync: function() {
    return Q($.ajax({
      data: {context: Date.now().toString()},
      dataType: 'json',
      url: appconfig.api.urls.fields,
    }))
    .then(function(data) {
      if ('columns' in data && 'columns_tree' in data) {
        // Change "birth" column from date to year.
        var birth = data.columns.birth;
        birth['@type'] = 'Integer';
        birth.default = parseInt(birth.default.slice(0, 4));
        birth.label = 'Année de naissance';
        birth.max = new Date().getFullYear();
        birth.min = appconfig.constants.minYear;
        birth.val_type = 'year'; // jshint ignore:line
        data.columns.nom_individu.required = true; // jshint ignore:line
        return Q(this.set({
          columns: data.columns,
          columnsTree: data.columns_tree, // jshint ignore:line
        }));
      } else {
        throw new Error('invalid fields data: no columns or no columns_tree');
      }
    }.bind(this));
  },
  repairTestCaseAsync: function() {
//    var data = {
//      context: Date.now().toString(),
//      scenarios: [
//        {
//          test_case: this.get('testCaseForAPI'), // jshint ignore:line
//          year: chartsM.get('year'),
//        },
//      ],
//      validate: true,
//    };
    return Q($.ajax({
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      method: 'POST',
      url: appconfig.api.urls.simulate,
      xhrFields: {
        withCredentials: true,
      },
    }))
    .then(
      function fulfillmentHandler(data) {
        var fixTestCase = function(testCase) {
         // This function modifies input!
          _.each(testCase.individus, function(individu, id) {
            // Add individu ID to each individu.
            individu.id = id;
            // Change "birth" column from date to year.
            if ('birth' in individu) {
              individu.birth = parseInt(individu.birth.slice(0, 4));
            }
          });
        }.bind(this);
        var testCase = data.repaired_scenarios[0].test_case; // jshint ignore:line
        fixTestCase(testCase);
        var suggestions = null;
        if ('suggestions' in data) {
          suggestions = data.suggestions.scenarios[0].test_case; // jshint ignore:line
          _.each(suggestions.individus, function(individu) {
            // Change "birth" column from date to year.
            if ('birth' in individu) {
              individu.birth = parseInt(individu.birth.slice(0, 4));
            }
          });
        }
        return Q(this.set({errors: null, suggestions: suggestions, testCase: testCase}));
      }.bind(this),
      function rejectionHandler(error) {
        if ('responseJSON' in error && 'error' in error.responseJSON) {
          if ('errors' in error.responseJSON.error) {
            return Q(this.set('errors', error.responseJSON.error.errors[0].scenarios[0].test_case)); // jshint ignore:line
          } else {
            return Q(this.set('status', {message: error.responseJSON.error.message, type: 'error'}));
          }
        } else {
          throw error;
        }
      }.bind(this)
    );
  },
  saveTestCaseAsync: function() {
    return Q(this.set('status', {message: 'Sauvegarde', type: 'info'}))
    .then(function() {
      return $.ajax({
        contentType: 'application/json',
        data: JSON.stringify({
          context: Date.now().toString(),
          test_case: this.get('testCaseForAPI'), // jshint ignore:line
        }),
        method: 'POST',
        url: appconfig.enabledModules.situationForm.urlPaths.currentTestCase,
      });
    }.bind(this))
    .then(function() { this.set('status', null); }.bind(this));
  },
});

var situationForm = new SituationForm({
  debug: appconfig.debug,
  el: '#form-wrapper',
});

module.exports = situationForm;
