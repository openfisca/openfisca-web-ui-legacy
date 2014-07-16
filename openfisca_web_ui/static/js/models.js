'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  mapObject = require('map-object'),
  React = require('react/addons'),
  uuid = require('uuid');


var entitiesMetadata = {
  familles: {
    label: 'Famille',
    maxCardinality: {parents: 2},
    nameKey: 'nom_famille',
    roles: ['parents', 'enfants'],
  },
  foyers_fiscaux: { // jshint ignore:line
    label: 'Déclaration d\'impôt',
    maxCardinality: {declarants: 2},
    nameKey: 'nom_foyer_fiscal',
    roles: ['declarants', 'personnes_a_charge'],
  },
  menages: {
    label: 'Logement principal',
    maxCardinality: {conjoint: 1, personne_de_reference: 1}, // jshint ignore:line
    nameKey: 'nom_menage',
    roles: ['personne_de_reference', 'conjoint', 'enfants', 'autres'],
  },
};

var kinds = Object.keys(entitiesMetadata);

// obj('a', 1, 'b', 2) returns {a: 1, b: 2}
var obj = function() { return Lazy(Array.prototype.slice.call(arguments)).chunk(2).toObject(); };

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
  findEntity: function(individuId, kind, role, testCase) {
    if ( ! (kind in testCase)) {
      return null;
    }
    var entities = testCase[kind];
    for (var entityId in entities) {
      var entity = entities[entityId];
      // FIXME role can be a singleton.
      if (role in entity && entity[role].indexOf(individuId) !== -1) {
        return {id: entityId, entity: entity};
      }
    }
    return null;
  },
  findEntityAndRole: function(individuId, kind, testCase) {
    if ( ! (kind in testCase)) {
      return null;
    }
    var entities = testCase[kind];
    var hasRole = function(role) { return TestCase.hasRoleInEntity(individuId, kind, entity, role); };
    for (var entityId in entities) {
      var entity = entities[entityId];
      var role = Lazy(entitiesMetadata[kind].roles).find(hasRole);
      if (role) {
        return {entity: entity, id: entityId, role: role};
      }
    }
    return null;
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
    if (testCase && testCase[kind]) {
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
  hasRole: function(individuId, kind, role, testCase) {
    return !! TestCase.findEntity(individuId, kind, role, testCase);
  },
  hasRoleInEntity: function(individuId, kind, entity, role) {
    if (TestCase.isSingleton(kind, role)) {
      return entity[role] === individuId;
    } else {
      return entity[role] && entity[role].indexOf(individuId) !== -1;
    }
  },
  isSingleton: function(kind, role) {
    return entitiesMetadata[kind].maxCardinality[role] === 1;
  },
  moveIndividuInEntity: function(individuId, kind, id, role, testCase) {
    var oldEntity = TestCase.findEntityAndRole(individuId, kind, testCase);
    var newTestCase = testCase;
    if (oldEntity) {
      newTestCase = TestCase.withoutIndividuInEntity(individuId, kind, oldEntity.id, oldEntity.role, newTestCase);
    }
    newTestCase = TestCase.withIndividuInEntity(individuId, kind, id, role, newTestCase);
    return newTestCase;
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
    var newEntity = Lazy(testCase[kind]).omit([id]).toObject();
    if (Object.keys(newEntity).length === 0) {
      newEntity = null;
    }
    var spec = {};
    spec[kind] = {$set: newEntity};
    var newTestCase = React.addons.update(testCase, spec);
    return newTestCase;
  },
  withoutIndividu: function(id, testCase) {
    var newTestCase = testCase;
    kinds.forEach(function(kind) {
      var oldEntity = TestCase.findEntityAndRole(id, kind, testCase);
      if (oldEntity) {
        newTestCase = TestCase.withoutIndividuInEntity(id, kind, oldEntity.id, oldEntity.role, newTestCase);
      }
    });
    var newIndividus = Lazy(testCase.individus).omit([id]).toObject();
    newTestCase = Lazy(newTestCase).assign({individus: newIndividus}).toObject();
    return newTestCase;
  },
  withoutIndividuInEntity: function(individuId, kind, id, role, testCase) {
    var newValue;
    if (TestCase.isSingleton(kind, role)) {
      invariant(testCase[kind][id][role] === individuId, 'individuId is not referenced by entity role in testCase');
      newValue = null;
    } else {
      newValue = Lazy(testCase[kind][id][role]).without(individuId).toArray();
    }
    var newEntity = Lazy(testCase[kind][id]).assign(obj(role, newValue)).toObject();
    var newEntities = Lazy(testCase[kind]).assign(obj(id, newEntity)).toObject();
    var newTestCase = Lazy(testCase).assign(obj(kind, newEntities)).toObject();
    return newTestCase;
  },
};

module.exports = {
  entitiesMetadata: entitiesMetadata,
  kinds: kinds,
  roleLabels: roleLabels,
  TestCase: TestCase,
};
