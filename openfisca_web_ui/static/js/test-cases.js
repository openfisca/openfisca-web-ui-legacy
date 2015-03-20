'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  uuid = require('uuid');


function createEntity(kind, entitiesMetadata, testCase) {
  var id = uuid.v4();
  var entity = {id};
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


function createIndividu(entitiesMetadata, testCase) {
  return createEntity('individus', entitiesMetadata, testCase);
}


function duplicateValuesOverThreeYears(entitiesMetadata, testCase, year) {
  var newTestCase = Lazy(testCase).map((entities, entityKey) => {
    var newEntities = Lazy(entities).map((entity) => {
      var newEntity = Lazy(entity).map((value, key) => {
        if (
          key === 'id' || key === entitiesMetadata[entityKey].nameKey ||
          entitiesMetadata[entityKey].roles && entitiesMetadata[entityKey].roles.includes(key)
        ) {
          return [key, value];
        } else {
          var newValue = {
            [year]: value,
            [year - 1]: value,
            [year - 2]: value,
          };
          return [key, newValue];
        }
      }).toObject();
      return newEntity;
    }).toArray();
    return [entityKey, newEntities];
  }).toObject();
  return newTestCase;
}


function findEntity(kind, id, testCase) {
  var entity = testCase[kind].find((entity) => entity.id === id);
  invariant(entity, 'entity was not found in testCase');
  return entity;
}


function findEntityAndRole(individuId, kind, entitiesMetadata, testCase, {check}) {
  var entities = testCase[kind];
  for (let idx in entities) {
    var entity = entities[idx];
    var role = entitiesMetadata[kind].roles.find(
      (role) => hasRoleInEntity(individuId, kind, entity, role, entitiesMetadata)
    );
    if (role) {
      return {entity, role};
    }
  }
  if (check) {
    invariant(false, 'entity and role not found');
  } else {
    return null;
  }
}


function getEntitiesKinds(entitiesMetadata, {collective = true, persons = true} = {}) {
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
  testCase.individus = [individu];
  getEntitiesKinds(entitiesMetadata, {persons: false}).forEach(kind => {
    var entity = createEntity(kind, entitiesMetadata, testCase);
    var defaultRole = entitiesMetadata[kind].roles[0];
    if (isSingleton(kind, defaultRole, entitiesMetadata)) {
      entity[defaultRole] = individu.id;
    } else {
      entity[defaultRole].push(individu.id);
    }
    testCase[kind] = [entity];
  });
  return testCase;
}


function guessEntityName(kind, entitiesMetadata, testCase) {
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


function hasRoleInEntity(individuId, kind, entity, role, entitiesMetadata) {
  return isSingleton(kind, role, entitiesMetadata) ?
    entity[role] === individuId :
    entity[role] && entity[role].indexOf(individuId) !== -1;
}


function isSingleton(kind, role, entitiesMetadata) {
  return entitiesMetadata[kind].maxCardinalityByRoleKey[role] === 1;
}


function moveIndividuInEntity(individuId, kind, id, role, entitiesMetadata, testCase) {
  var oldEntityData = findEntityAndRole(individuId, kind, entitiesMetadata, testCase, {check: true});
  var newTestCase = withoutIndividuInEntity(individuId, kind, oldEntityData.entity.id, oldEntityData.role,
    entitiesMetadata, testCase);
  newTestCase = withIndividuInEntity(individuId, kind, id, role, entitiesMetadata, newTestCase);
  return newTestCase;
}


function replaceEntity(kind, id, newEntity, testCase) {
  var newEntities = Lazy(testCase[kind]).reject((entity) => entity.id === id).concat([newEntity]).toArray();
  var newTestCase = Lazy(testCase).assign({[kind]: newEntities}).toObject();
  return newTestCase;
}


function withEntity(kind, newEntity, testCase) {
  var entities = kind in testCase ? testCase[kind] : [];
  var newEntities = entities.concat(newEntity);
  var newTestCase = Lazy(testCase).assign({[kind]: newEntities}).toObject();
  return newTestCase;
}


function withEntitiesNamesFilled(entitiesMetadata, testCase) {
  var newEntities = Lazy(getEntitiesKinds(entitiesMetadata, {persons: false})).map(kind => {
    var newEntitiesOfKind = Lazy(testCase[kind]).map((entity) => {
      var nameKey = entitiesMetadata[kind].nameKey;
      if (entity[nameKey]) {
        return entity;
      } else {
        var newName = guessEntityName(kind, entitiesMetadata, testCase);
        var newEntity = Lazy(entity).assign({[nameKey]: newName}).toObject();
        return newEntity;
      }
    }).toArray();
    return [kind, newEntitiesOfKind];
  }).toObject();
  var newTestCase = Lazy(testCase).assign(newEntities).toObject();
  return newTestCase;
}


function withIndividuInEntity(newIndividuId, kind, id, role, entitiesMetadata, testCase) {
  var entity = findEntity(kind, id, testCase);
  var newEntitySequence = Lazy(entity);
  var newEntity;
  if (isSingleton(kind, role, entitiesMetadata)) {
    invariant( ! entity[role], `role ${role} is already used in singleton`);
    newEntity = newEntitySequence.assign({[role]: newIndividuId}).toObject();
  } else {
    var individuIds = newEntitySequence.get(role) || [];
    var newIndividuIds = individuIds.concat(newIndividuId);
    newEntity = newEntitySequence.assign({[role]: newIndividuIds}).toObject();
  }
  var newTestCase = replaceEntity(kind, id, newEntity, testCase);
  return newTestCase;
}


function withoutEntity(kind, id, testCase) {
  var newEntities = Lazy(testCase[kind]).reject((entity) => entity.id === id).toArray();
  if (newEntities.length === 0) {
    newEntities = null;
  }
  var newTestCase = Lazy(testCase).assign({[kind]: newEntities}).toObject();
  return newTestCase;
}


function withoutIndividu(id, entitiesMetadata, testCase) {
  var newTestCase = testCase;
  var kinds = getEntitiesKinds(entitiesMetadata, {persons: false});
  kinds.forEach((kind) => {
    var oldEntityData = findEntityAndRole(id, kind, entitiesMetadata, testCase, {check: true});
    newTestCase = withoutIndividuInEntity(id, kind, oldEntityData.entity.id, oldEntityData.role, entitiesMetadata,
      newTestCase);
  });
  var newIndividus = Lazy(testCase.individus).reject((individu) => individu.id === id).toArray();
  newTestCase = Lazy(newTestCase).assign({individus: newIndividus}).toObject();
  return newTestCase;
}


function withoutIndividuInEntity(individuId, kind, id, role, entitiesMetadata, testCase) {
  var entity = findEntity(kind, id, testCase);
  var newEntities, newEntity, newTestCase;
  var removeRole = () => {
    newEntity = Lazy(entity).omit([role]).toObject();
    newTestCase = replaceEntity(kind, id, newEntity, testCase);
    return newTestCase;
  };
  if (isSingleton(kind, role, entitiesMetadata)) {
    newTestCase = removeRole();
  } else {
    var newIndividuIds = Lazy(entity[role]).without(individuId).toArray();
    if (newIndividuIds.length) {
      newEntity = Lazy(entity).assign({[role]: newIndividuIds}).toObject();
      newTestCase = replaceEntity(kind, id, newEntity, testCase);
    } else {
      newTestCase = removeRole();
    }
  }
  return newTestCase;
}

module.exports = {
  createEntity, createIndividu, duplicateValuesOverThreeYears, findEntity, findEntityAndRole, getEntitiesKinds,
  getEntityLabel, getInitialTestCase, guessEntityName, hasRoleInEntity, isSingleton, moveIndividuInEntity,
  replaceEntity, withEntity, withEntitiesNamesFilled, withIndividuInEntity, withoutEntity, withoutIndividu,
  withoutIndividuInEntity,
};
