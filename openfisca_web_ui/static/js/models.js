'use strict';

var mapObject = require('map-object'),
  React = require('react/addons'),
  _ = require('underscore'),
  uuid = require('uuid');


var entitiesMetadata = {
  familles: {
    label: 'Famille',
    nameKey: 'nom_famille',
    roles: ['parents', 'enfants'],
  },
  foyers_fiscaux: { // jshint ignore:line
    label: 'Déclaration d\'impôt',
    nameKey: 'nom_foyer_fiscal',
    roles: ['declarants', 'personnes_a_charge'],
  },
  menages: {
    label: 'Logement principal',
    nameKey: 'nom_menage',
    roles: ['personne_de_reference', 'conjoint', 'enfants', 'autres'],
    singletons: ['conjoint', 'personne_de_reference'],
  },
};

var kinds = Object.keys(entitiesMetadata);

var roleLabels = {
  autres: 'Autres',
  conjoint: 'Conjoint',
  declarants: 'Déclarants',
  enfants: 'Enfants',
  parents: 'Parents',
  personne_de_reference: 'Personne de référence', // jshint ignore:line
  personnes_a_charge: 'Personnes à charge', // jshint ignore:line
};

var TestCase = {
  createEntity: function(kind, testCase) {
    var entity = {};
    entitiesMetadata[kind].roles.forEach(function(role) {
      entity[role] = TestCase.isSingleton(kind, role) ? null : [];
    });
    var nameKey = entitiesMetadata[kind].nameKey;
    entity[nameKey] = TestCase.guessEntityName(kind, testCase);
    return entity;
  },
  createIndividu: function(testCase) {
    var namePrefix = 'Personne ';
    var value;
    if (testCase) {
      var values = mapObject(testCase.individus, function(individu) {
        var name = individu.nom_individu; // jshint ignore:line
         if (name) {
          return parseInt(name.slice(namePrefix.length, name.length));
        }
      }).filter(function(value) { return value; });
      var maxValue = values.length ? Math.max.apply(null, values) : 0;
      value = maxValue + 1;
    } else {
      value = 1;
    }
    var name = namePrefix + value.toString();
    return {nom_individu: name}; // jshint ignore:line
  },
  getEntityLabel: function(kind, entity) {
    var label = entitiesMetadata[kind].label;
    var name = entity[entitiesMetadata[kind].nameKey];
    return label + ' ' + name;
  },
  getInitialTestCase: function() {
    var individu = TestCase.createIndividu();
    var individus = {};
    var individuId = uuid.v4();
    individus[individuId] = individu;
    // Add individu to new famille.
    var famille = TestCase.createEntity('familles');
    famille.nom_famille = '1'; // jshint ignore:line
    famille.parents.push(individuId);
    var familles = {};
    familles[uuid.v4()] = famille;
    // Add individu to new foyer fiscal.
    var foyerFiscal = TestCase.createEntity('foyers_fiscaux');
    foyerFiscal.nom_foyer_fiscal = '1'; // jshint ignore:line
    foyerFiscal.declarants.push(individuId);
    var foyersFiscaux = {};
    foyersFiscaux[uuid.v4()] = foyerFiscal;
    // Add individu to new menage.
    var menage = TestCase.createEntity('menages');
    menage.nom_menage = '1'; // jshint ignore:line
    menage.personne_de_reference = individuId; // jshint ignore:line
    var menages = {};
    menages[uuid.v4()] = menage;
    var testCase = {
      familles: familles,
      foyers_fiscaux: foyersFiscaux, // jshint ignore:line
      individus: individus,
      menages: menages,
    };
    return testCase;
  },
  guessEntityName: function(kind, testCase) {
    var nameKey = entitiesMetadata[kind].nameKey;
    var value;
    if (testCase) {
      var values = mapObject(testCase[kind], function(entity) {
        var name = entity[nameKey];
        if (name) {
          return parseInt(name);
        }
      }).filter(function(value) { return value; });
      var maxValue = values.length ? Math.max.apply(null, values) : 0;
      value = maxValue + 1;
    } else {
      value = 1;
    }
    var name = value.toString();
    return name;
  },
  isSingleton: function(kind, role) {
    return 'singletons' in entitiesMetadata[kind] && entitiesMetadata[kind].singletons.indexOf(role) !== -1;
  },
  withEntitiesNamesFilled: function(testCase) {
    var spec = {};
    kinds.forEach(function(kind) {
      mapObject(testCase[kind], function(entity, id) {
        var nameKey = entitiesMetadata[kind].nameKey;
        if ( ! entity[nameKey]) {
          var newName = TestCase.guessEntityName(kind, testCase);
          spec[kind] = {};
          spec[kind][id] = {};
          spec[kind][id][nameKey] = {$set: newName};
        }
      });
    });
    var newTestCase = React.addons.update(testCase, spec);
    return newTestCase;
  },
  withIndividuInEntity: function(newIndividuId, kind, id, role, testCase) {
    var spec = {};
    spec[kind] = {};
    spec[kind][id] = {};
    if (TestCase.isSingleton(kind, role)) {
      spec[kind][id][role] = {$set: newIndividuId};
    } else {
      spec[kind][id][role] = testCase[kind][id][role] ? {$push: [newIndividuId]} : {$set: [newIndividuId]};
    }
    var newTestCase = React.addons.update(testCase, spec);
    return newTestCase;
  },
  withoutEntity: function (kind, id, testCase) {
    var newEntity = _.omit(testCase[kind], id);
    if (Object.keys(newEntity).length === 0) {
      newEntity = null;
    }
    var spec = {};
    spec[kind] = {$set: newEntity};
    var newTestCase = React.addons.update(testCase, spec);
    return newTestCase;
  },
  withoutIndividu: function(id, testCase) {
    var newTestCase = {};
    var newIndividus = _.omit(testCase.individus, id);
    newTestCase.individus = newIndividus;
    kinds.forEach(function(kind) {
      var entities = testCase[kind];
      var newEntities = {};
      Object.keys(entities).forEach(function(entityId) {
        var entity = entities[entityId];
        var entityMetadata = entitiesMetadata[kind];
        var newEntity = _.omit(entity, entityMetadata.roles);
        entityMetadata.roles.forEach(function(role) {
          if (role in entity) {
            if (TestCase.isSingleton(kind, role)) {
              if (entity[role] !== id) {
                newEntity[role] = entity[role];
              }
            } else if (entity[role] && entity[role].indexOf(id) !== -1) {
              var newRoleIndividus = _.without(entity[role], id);
              if (newRoleIndividus.length) {
                newEntity[role] = newRoleIndividus;
              }
            }
          }
        });
        newEntities[entityId] = newEntity;
      });
      newTestCase[kind] = newEntities;
    });
    return newTestCase;
  },
};

module.exports = {
  entitiesMetadata: entitiesMetadata,
  roleLabels: roleLabels,
  TestCase: TestCase,
};
