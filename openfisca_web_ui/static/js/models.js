'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  uuid = require('uuid');

var helpers = require('./helpers');


function createEntity(kind, entitiesMetadata, testCase = null) {
  var entity = {};
  var roles = entitiesMetadata[kind].roles;
  if (roles) {
    roles.forEach(role => {
      entity[role] = isSingleton(kind, role, entitiesMetadata) ? null : [];
    });
  }
  var nameKey = entitiesMetadata[kind].nameKey;
  entity[nameKey] = guessEntityName(kind, entitiesMetadata, testCase);
  return entity;
}


function createIndividu(entitiesMetadata, testCase = null) {
  return createEntity('individus', entitiesMetadata, testCase);
}


function findEntity(individuId, kind, role, testCase) {
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
}


function findEntityAndRole(individuId, kind, entitiesMetadata, testCase) {
  if ( ! (kind in testCase)) {
    return null;
  }
  var entities = testCase[kind];
  var hasRole = role => hasRoleInEntity(individuId, kind, entity, role, entitiesMetadata);
  for (var entityId in entities) {
    var entity = entities[entityId];
    var role = Lazy(entitiesMetadata[kind].roles).find(hasRole);
    if (role) {
      return {entity: entity, id: entityId, role: role};
    }
  }
  return null;
}


function getEntitiesKinds(entitiesMetadata, {collective = true, persons = true}) {
  invariant(collective || persons, 'collective or persons must be specified');
  return Object.keys(entitiesMetadata).filter((kind) => {
    var isPersonsEntity = entitiesMetadata[kind].isPersonsEntity;
    return collective && ! isPersonsEntity || persons && isPersonsEntity;
  });
}


function getEntityLabel(kind, entity, entitiesMetadata) {
  var nameKey = entitiesMetadata[kind].nameKey;
  var name = entity[nameKey];
  if (kind === 'individus') {
    return name;
  } else {
    var label = entitiesMetadata[kind].label;
    return `${label} ${name}`;
  }
}


function getInitialTestCase(entitiesMetadata) {
  var testCase = {};
  var individu = createIndividu(entitiesMetadata, testCase);
  var individuId = uuid.v4();
  testCase.individus = {[individuId]: individu};
  getEntitiesKinds(entitiesMetadata, {persons: false}).forEach(kind => {
    var entity = createEntity(kind, entitiesMetadata, testCase);
    var defaultRole = entitiesMetadata[kind].roles[0];
    if (isSingleton(kind, defaultRole, entitiesMetadata)) {
      entity[defaultRole] = individuId;
    } else {
      entity[defaultRole].push(individuId);
    }
    testCase[kind] = {[uuid.v4()]: entity};
  });
  return testCase;
}


function guessEntityName(kind, entitiesMetadata, testCase = null) {
  var label = entitiesMetadata[kind].label,
    nameKey = entitiesMetadata[kind].nameKey;
  var value;
  if (testCase && testCase[kind]) {
    var values = Lazy(testCase[kind]).map(entity => {
      var name = entity[nameKey];
      if (name) {
        if (name.startsWith(label)) {
          name = name.slice(label.length + 1);
        }
        return parseInt(name);
      } else {
        return null;
      }
    }).compact().toArray();
    var maxValue = values.length ? Math.max.apply(null, values) : 0;
    value = maxValue + 1;
  } else {
    value = 1;
  }
  var name = value.toString();
  return kind === 'individus' ? `${label} ${name}` : name;
}


function hasRole(individuId, kind, role, testCase) {
  return !! findEntity(individuId, kind, role, testCase);
}


function hasRoleInEntity(individuId, kind, entity, role, entitiesMetadata) {
  if (isSingleton(kind, role, entitiesMetadata)) {
    return entity[role] === individuId;
  } else {
    return entity[role] && entity[role].indexOf(individuId) !== -1;
  }
}


function isSingleton(kind, role, entitiesMetadata) {
  return entitiesMetadata[kind].maxCardinalityByRoleKey[role] === 1;
}


function moveIndividuInEntity(individuId, kind, id, role, entitiesMetadata, testCase) {
  var oldEntity = findEntityAndRole(individuId, kind, entitiesMetadata, testCase);
  var newTestCase = testCase;
  if (oldEntity) {
    newTestCase = withoutIndividuInEntity(individuId, kind, oldEntity.id, oldEntity.role, entitiesMetadata,
      newTestCase);
  }
  newTestCase = withIndividuInEntity(individuId, kind, id, role, entitiesMetadata, newTestCase);
  return newTestCase;
}


function withEntitiesNamesFilled(entitiesMetadata, testCase) {
  var newEntities = Lazy(getEntitiesKinds(entitiesMetadata, {persons: false})).map(kind => {
    var newEntitiesOfKind = Lazy(testCase[kind]).map((entity, id) => {
      var nameKey = entitiesMetadata[kind].nameKey;
      if (entity[nameKey]) {
        return [id, entity];
      } else {
        var newName = guessEntityName(kind, entitiesMetadata, testCase);
        var newEntity = Lazy(entity).assign({[nameKey]: newName}).toObject();
        return [id, newEntity];
      }
    }).toObject();
    return [kind, newEntitiesOfKind];
  }).toObject();
  var newTestCase = Lazy(testCase).assign(newEntities).toObject();
  return newTestCase;
}


function withIndividuInEntity(newIndividuId, kind, id, role, entitiesMetadata, testCase) {
  var newEntitySequence = Lazy(testCase[kind][id]);
  var newEntity;
  if (isSingleton(kind, role, entitiesMetadata)) {
    newEntity = newEntitySequence.assign({[role]: newIndividuId}).toObject();
  } else {
    var newIndividuIds = Lazy(newEntitySequence.get(role)).concat(newIndividuId).toArray();
    newEntity = newEntitySequence.assign({[role]: newIndividuIds}).toObject();
  }
  var newEntitiesOfKind = Lazy(testCase[kind]).assign({[id]: newEntity}).toObject();
  var newTestCase = Lazy(testCase).assign({[kind]: newEntitiesOfKind}).toObject();
  return newTestCase;
}


function withoutEntity(kind, id, testCase) {
  var newEntitiesOfKind = Lazy(testCase[kind]).omit([id]).toObject();
  if (Object.keys(newEntitiesOfKind).length === 0) {
    newEntitiesOfKind = null;
  }
  var newTestCase = Lazy(testCase).assign({[kind]: newEntitiesOfKind}).toObject();
  return newTestCase;
}


function withoutIndividu(id, entitiesMetadata, testCase) {
  var newTestCase = testCase;
  var kinds = getEntitiesKinds(entitiesMetadata, {persons: false});
  kinds.forEach(function(kind) {
    var oldEntity = findEntityAndRole(id, kind, entitiesMetadata, testCase);
    if (oldEntity) {
      newTestCase = withoutIndividuInEntity(id, kind, oldEntity.id, oldEntity.role, entitiesMetadata, newTestCase);
    }
  });
  var newIndividus = Lazy(testCase.individus).omit([id]).toObject();
  newTestCase = Lazy(newTestCase).assign({individus: newIndividus}).toObject();
  return newTestCase;
}


function withoutIndividuInEntity(individuId, kind, id, role, entitiesMetadata, testCase) {
  var newTestCase;
  if (isSingleton(kind, role, entitiesMetadata)) {
    invariant(testCase[kind][id][role] === individuId, 'individuId is not referenced by entity role in testCase');
    newTestCase = helpers.assignIn(testCase, [kind, id], Lazy(testCase[kind][id]).omit([role]).toObject());
  } else {
    var newIndividuIds = Lazy(testCase[kind][id][role]).without(individuId).toArray();
    newTestCase = newIndividuIds.length ?
      helpers.assignIn(testCase, [kind, id, role], newIndividuIds) :
      helpers.assignIn(testCase, [kind, id], Lazy(testCase[kind][id]).omit([role]).toObject());
  }
  return newTestCase;
}

module.exports = {
  createEntity, createIndividu, findEntity, findEntityAndRole, getEntitiesKinds, getEntityLabel, getInitialTestCase,
  guessEntityName, hasRole, hasRoleInEntity, isSingleton, moveIndividuInEntity, withEntitiesNamesFilled,
  withIndividuInEntity, withoutEntity, withoutIndividu, withoutIndividuInEntity,
};
