'use strict';

var _ = require('underscore'),
  uuid = require('uuid');


var entitiesMetadata = {
  familles: {
    label: 'Famille',
    lists: ['enfants', 'parents'],
    nameKey: 'nom_famille',
  },
  foyers_fiscaux: { // jshint ignore:line
    label: 'Déclaration d\'impôt',
    lists: ['declarants', 'personnes_a_charge'],
    nameKey: 'nom_foyer_fiscal',
  },
  menages: {
    label: 'Logement principal',
    lists: ['autres', 'enfants'],
    nameKey: 'nom_menage',
    singletons: ['conjoint', 'personne_de_reference'],
  },
};

function getEntityRoles(kind) {
  var roles = [];
  if ('lists' in entitiesMetadata[kind]) {
    roles = roles.concat(entitiesMetadata[kind].lists);
  }
  if ('singletons' in entitiesMetadata[kind]) {
    roles = roles.concat(entitiesMetadata[kind].singletons);
  }
  return roles;
}

var TestCase = {
  createEntities: function(kind) {
    var entities = {};
    entities[uuid.v4()] = TestCase.createEntity(kind);
    return entities;
  },
  createEntity: function(kind) {
    var entity = {};
    if ('lists' in entitiesMetadata[kind]) {
      entitiesMetadata[kind].lists.forEach(function(role) {
        entity[role] = [];
      });
    }
    if ('singletons' in entitiesMetadata[kind]) {
      entitiesMetadata[kind].singletons.forEach(function(role) {
        entity[role] = null;
      });
    }
    return entity;
  },
  createIndividu: function() {
    return {nom_individu: 'Personne 1'}; // jshint ignore:line
  },
//  deleteEntity: function (kind, id) {
//    
//  },
  getEntityLabel: function(kind, entity) {
    var entityLabel = entitiesMetadata[kind].label;
    var entityName = entity[entitiesMetadata[kind].nameKey];
    if (entityName) {
      entityLabel += ' ' + entityName;
    }
    return entityLabel;
  },
  getInitialTestCase: function() {
    var individu = TestCase.createIndividu();
    var individus = {};
    var individuId = uuid.v4();
    individus[individuId] = individu;
    var famille = TestCase.createEntity('familles');
    famille.nom_famille = '1';
    famille.parents.push(individuId);
    var familles = {};
    familles[uuid.v4()] = famille;
    var testCase = {
      familles: familles,
      foyers_fiscaux: null, // jshint ignore:line
      individus: individus,
      menages: null,
    };
    return testCase;
  },
  withoutIndividu: function(id, testCase) {
    var newTestCase = {};
    var newIndividus = _.omit(testCase.individus, id);
    newTestCase.individus = newIndividus;
    var kinds = Object.keys(entitiesMetadata);
    kinds.forEach(function(kind) {
      var entities = testCase[kind];
      var newEntities = {};
      Object.keys(entities).forEach(function(entityId) {
        var entity = entities[entityId];
        var newEntity = _.omit(entity, getEntityRoles(kind));
        if ('lists' in entitiesMetadata[kind]) {
          entitiesMetadata[kind].lists.forEach(function(role) {
            if (role in entity && entity[role].length) {
              var newRoleIndividus = _.without(entity[role], id);
              if (newRoleIndividus.length) {
                newEntity[role] = newRoleIndividus;
              }
            }
          });
        }
        if ('singletons' in entitiesMetadata[kind]) {
          entitiesMetadata[kind].singletons.forEach(function(role) {
            if (role in entity && entity[role] !== id) {
              newEntity[role] =  entity[role];
            }
          });
        }
        newEntities[entityId] = newEntity;
      });
      newTestCase[kind] = newEntities;
    });
    return newTestCase;
  },
};

module.exports = {
  entitiesMetadata: entitiesMetadata,
  TestCase: TestCase,
};
