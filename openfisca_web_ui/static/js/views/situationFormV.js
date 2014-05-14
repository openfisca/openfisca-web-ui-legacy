define([
  'jquery',
  'Q',
  'ractive',
  'underscore',

  'appconfig',
  'chartsM',
  'rv!situationFormT',
],
function ($, Q, Ractive, _, appconfig, chartsM, situationFormT) {
  'use strict';

  if ( ! ('situationForm' in appconfig.enabledModules)) {
    return;
  }

  var entitiesMetadata = {
    familles: {
      lists: ['enfants', 'parents'],
    },
    foyers_fiscaux: { // jshint ignore:line
      lists: ['declarants', 'personnes_a_charge'],
    },
    menages: {
      lists: ['autres', 'enfants'],
      singletons: ['conjoint', 'personne_de_reference'],
    },
  };

  var SituationFormV = Ractive.extend({
    computed: {
      testCaseForAPI: function() {
        // Returns a copy of testCase reworked to be compliant with the API inputs.
        var testCase = this.get('testCase');
        if (testCase === null) {
          return null;
        } else {
          // Remove individu IDs.
          var testCaseForAPI = _.omit(testCase, 'individus'); // This is a copy.
          testCaseForAPI.individus = _.object(
            _.map(testCase.individus, function(individu, id) { return [id, _.omit(individu, 'id')];})
          );
          return testCaseForAPI;
        }
      }
    },
    data: {
      _: _,
      columns: null,
      columnsTree: null,
      defaultLabel: function(column) {
        var modalType = this.get('modal.type');
        var suggestedValue;
        switch (modalType) {
          case 'editEntity':
            var entityId = this.get('modal.entityId');
            var entityKey = this.get('modal.entityKey');
            suggestedValue = this.get(['suggestions', entityKey, entityId, column.name].join('.'));
            break;
          case 'editIndividu':
            var individuId = this.get('modal.values.id');
            suggestedValue = this.get('suggestions.individus.' + individuId + '.' + column.name);
            break;
        }
        function booleanToString(value) { return value ? 'Oui' : 'Non'; }
        switch (column['@type']) {
          case 'Boolean':
            if (_.isUndefined(suggestedValue)) {
              return 'valeur par défaut : ' + booleanToString(column.default); // jshint ignore:line
            } else {
              return 'valeur suggérée : ' + booleanToString(suggestedValue); // jshint ignore:line
            }
            break;
          case 'Enumeration':
            if (_.isUndefined(suggestedValue)) {
              return column.labels[column.default] + ' (valeur par défaut)';
            } else {
              return column.labels[suggestedValue] + ' (valeur suggérée)';
            }
            break;
        }
        return null;
      },
      entityLabel: function(entityKey) {
        return {
          familles: 'famille',
          foyers_fiscaux: 'déclaration d\'impôt', // jshint ignore:line
          menages: 'ménage',
        }[entityKey];
      },
      errors: null,
      getKey: function(obj, key) { return ! _.isUndefined(key) && key in obj ? obj[key.toString()] : null; },
      modal: null,
      suggestions: null,
      testCase: null,
    },
    template: situationFormT,

    init: function() {
      this.fetchFieldsAsync();
      this.initEvents();
      this.observe({
        'testCase.*.*': function(newValue, oldValue, keypath) {
          // Transform boolean as strings ("0" or "1") into integers.
          _.each(newValue, function(value, columnName) {
            if (value !== '') {
              var columnType = this.get('columns.' + columnName + '.@type');
              if (columnType === 'Boolean') {
                this.set(keypath + '.' + columnName, parseInt(value));
              }
            }
          }, this);
        },
      }, {debug: appconfig.debug, init: false});
    },

    // Event methods
    initEvents: function() {
      var saveRepairSimulateAsync = function() {
        return this.saveTestCaseAsync()
        .then(function() { return this.repairTestCaseAsync(); }.bind(this))
        .then(function() { return chartsM.simulateAsync(this.get('testCaseForAPI')); }.bind(this));
      }.bind(this);
      this.on({
        addEntity: function(event, entityKey) {
          event.original.preventDefault();
          this.addEntityAsync(entityKey)
          .then(function() { return saveRepairSimulateAsync(); }.bind(this))
          .done();
        },
        addIndividu: function(event, entityKey, roleKey) {
          this.addIndividuAsync(entityKey, event.index.entityId, roleKey)
          .then(function() { return saveRepairSimulateAsync(); }.bind(this))
          .done();
        },
        deleteEntity: function(event) {
          var confirmMessage = 'Supprimer « ' + this.get('entityLabel')(event.context.entityKey) + ' ' + // jshint ignore:line
            event.context.entityId +' »'; // jshint ignore:line
          if (confirm(confirmMessage)) {
            this.deleteEntityAsync(event.context.entityKey, event.context.entityId)
            .then(function() { return saveRepairSimulateAsync(); }.bind(this))
            .done();
          }
        },
        deleteIndividu: function(event) {
          if (confirm('Supprimer « ' + event.context.values.prenom + ' »')) { // jshint ignore:line
            $(this.find('#edit-individu-modal')).modal('hide');
            Q(this.set('modal', null))
            .then(function() { return this.deleteIndividuAsync(event.context.values.id); }.bind(this))
            .then(function() { return saveRepairSimulateAsync(); }.bind(this))
            .done();
          }
        },
        explainSuggestion: function() {
          alert('Le simulateur a suggéré cette valeur et l\'a utilisée dans ses calculs. ' +
            'Vous pouvez la modifier ou la conserver en la saisissant explicitement.');
        },
        moveIndividu: function(event) {
          Q.all([
            this.moveToEntityAsync(event.context.individuId, 'familles', event.context.famille.id,
              event.context.famille.roleKey),
            this.moveToEntityAsync(event.context.individuId, 'foyers_fiscaux', event.context.foyerFiscal.id,
              event.context.foyerFiscal.roleKey),
            this.moveToEntityAsync(event.context.individuId, 'menages', event.context.menage.id,
              event.context.menage.roleKey),
          ])
          .then(function() { return saveRepairSimulateAsync(); }.bind(this))
          .done();
        },
        repair: function(event) {
          event.original.preventDefault();
          return saveRepairSimulateAsync().done();
        },
        reset: function(event) {
          event.original.preventDefault();
          if (confirm('Réinitialiser le formulaire ?')) { // jshint ignore:line
            this.resetTestCaseAsync()
            .then(function() { return this.saveTestCaseAsync(); }.bind(this))
            .then(function() { window.location.reload(); })
            .done();
          }
        },
        saveEntity: function(event) {
          Q(this.set(['testCase', event.context.entityKey, event.context.entityId].join('.'), event.context.values))
          .then(function() { return saveRepairSimulateAsync(); }.bind(this))
          .done();
        },
        saveIndividu: function(event) {
          Q(this.set('testCase.individus.' + event.context.values.id, event.context.values))
          .then(function() { return saveRepairSimulateAsync(); }.bind(this))
          .done();
        },
        showEditEntityModal: function(event, entityKey) {
          event.original.preventDefault();
          Q(this.set('modal', {
            entityId: event.index.entityId,
            entityKey: entityKey,
            type: 'editEntity',
            values: _.clone(event.context),
          }))
          .then(function() {
            $(this.find('#edit-entity-modal'))
              .on('hide.bs.modal', function() { this.set('modal', null); }.bind(this))
              .modal('show');
          }.bind(this))
          .done();
        },
        showEditIndividuModal: function(event) {
          event.original.preventDefault();
          Q(this.set('modal', {
            type: 'editIndividu',
            values: _.clone(event.context),
          }))
          .then(function() {
            $(this.find('#edit-individu-modal'))
              .on('hide.bs.modal', function() { this.set('modal', null); }.bind(this))
              .modal('show');
          }.bind(this))
          .done();
        },
        showMoveIndividuModal: function(event) {
          event.original.preventDefault();
          var individuId = event.context.id;
          Q(this.set('modal', {
            famille: this.findEntityInfos(individuId, 'familles') || {roleKey: 'parents'},
            foyerFiscal: this.findEntityInfos(individuId, 'foyers_fiscaux') || {roleKey: 'declarants'}, // jshint ignore:line
            individuId: individuId,
            menage: this.findEntityInfos(individuId, 'menages') || {roleKey: 'personne_de_reference'},
            type: 'moveIndividu',
          }))
          .then(function() {
            $(this.find('#move-individu-modal'))
              .on('hide.bs.modal', function() { this.set('modal', null); }.bind(this))
              .modal('show');
          }.bind(this))
          .done();
        },
        simulate: function() {
          chartsM.simulate(this.get('testCaseForAPI'));
        },
      });
    },

    // Data methods
    addEntityAsync: function(entityKey) {
      var newEntityId = (_.keys((this.get('testCase.' + entityKey) || {})).length + 1).toString();
      var newEntity = {};
      _.each(entitiesMetadata[entityKey].lists, function(roleKey) {
        newEntity[roleKey] = [];
      });
      _.each(entitiesMetadata[entityKey].singletons, function(roleKey) {
        newEntity[roleKey] = null;
      });
      return Q(this.set(['testCase', entityKey, newEntityId].join('.'), newEntity));
    },
    addIndividuAsync: function(entityKey, entityId, roleKey) {
      var newIndividuId = (_.keys((this.get('testCase.individus') || {})).length + 1).toString();
      return Q(this.set('testCase.individus.' + newIndividuId, {
        id: newIndividuId,
        prenom: 'Personne ' + newIndividuId,
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
    deleteIndividuAsync: function(individuId) {
      return Q.all(
        _.chain(entitiesMetadata).keys().map(function(entityKey) {
          return this.detachFromEntityAsync(individuId, entityKey);
        }, this)
      )
      .then(function() {
        return Q(this.set('testCase.individus', _.omit(this.get('testCase.individus'), individuId)));
      }.bind(this));
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
    resetTestCaseAsync: function() {
      var individuId = '1';
      var individu = {id: individuId, prenom: 'Personne ' + individuId};
      var individus = {};
      individus[individuId] = individu;
      var testCase = {familles: null, foyers_fiscaux: null, individus: individus, menages: null};
      return Q(this.set({errors: null, suggestions: null, testCase: testCase}));
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
          birth.max = appconfig.constants.maxYear;
          birth.min = appconfig.constants.minYear;
          birth.val_type = 'year'; // jshint ignore:line
          data.columns.prenom.required = true;
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
      var testCaseForAPI = this.get('testCaseForAPI');
      var data = {
        context: Date.now().toString(),
        scenarios: [
          {
            test_case: testCaseForAPI, // jshint ignore:line
            year: chartsM.get('year'),
          },
        ],
        validate: true,
      };
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
              throw new Error(error.responseJSON.error.message);
            }
          } else {
            throw error;
          }
        }.bind(this)
      );
    },
    saveTestCaseAsync: function() {
      return Q($.ajax({
        contentType: 'application/json',
        data: JSON.stringify({
          context: Date.now().toString(),
          test_case: this.get('testCase'), // jshint ignore:line
        }),
        method: 'POST',
        url: appconfig.enabledModules.situationForm.urlPaths.currentTestCase,
      }));
    },
  });

  var situationFormV = new SituationFormV({
    debug: appconfig.debug,
    el: '#form-wrapper',
  });

  return situationFormV;
});
