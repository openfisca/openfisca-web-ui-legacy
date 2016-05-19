import invariant from 'invariant'
var Lazy = require('lazy.js');


function createEntity(kind, entitiesMetadata, testCase) {
  var id = guessEntityId(
    entitiesMetadata[kind].label,
    testCase[kind] ? testCase[kind].map(entity => entity.id) : null
  );
  var entity = {id};
  // TODO Do not initialize empty roles, defer on-demand.
  var roles = entitiesMetadata[kind].roles;
  if (roles) {
    roles.forEach(role => {
      entity[role] = isSingleton(kind, role, entitiesMetadata) ? null : [];
    });
  }
  return entity;
}


function createIndividu(entitiesMetadata, testCase) {
  return createEntity('individus', entitiesMetadata, testCase);
}


function duplicateValuesOverPastYears(entitiesMetadata, testCase, year) {
  var newTestCase = Lazy(testCase).map((entities, entityKey) => {
    var newEntities = Lazy(entities).map((entity) => {
      var newEntity = Lazy(entity).map((value, key) => {
        if (key === 'id' || entitiesMetadata[entityKey].roles && entitiesMetadata[entityKey].roles.includes(key)) {
          return [key, value];
        } else {
          var newValue = {
            [year]: value,
            [year - 1]: value,
            [year - 2]: value,
            [year - 3]: value,
            [year - 4]: value,
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


function findEntityAndRole(individuId, kind, entitiesMetadata, testCase, {check} = {}) {
  var entities = testCase[kind];
  for (let idx in entities) {
    var entity = entities[idx];
    var role = entitiesMetadata[kind].roles.find(role => hasRoleInEntity(individuId, kind, entity, role, entitiesMetadata));
    if (role) {
      // A person can appear in only one entity of the same kind.
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


function guessEntityId(label, ids) {
  var guessedIndex;
  if (ids) {
    var indexes = ids.map(id => id.startsWith(label) ? Number(id.slice(label.length + 1)) : null).filter(x => x);
    var maxIndex = Math.max(...indexes);
    guessedIndex = maxIndex + 1;
  } else {
    guessedIndex = 1;
  }
  return `${label} ${guessedIndex}`;
}


function getInitialTestCase(entitiesMetadata) {
  var testCase = {};
  var individu = createIndividu(entitiesMetadata, testCase);
  testCase.individus = [individu];
  getEntitiesKinds(entitiesMetadata, {persons: false}).forEach(kind => {
    var entity = createEntity(kind, entitiesMetadata, testCase);
    var firstRole = entitiesMetadata[kind].roles[0];
    if (isSingleton(kind, firstRole, entitiesMetadata)) {
      entity[firstRole] = individu.id;
    } else {
      entity[firstRole].push(individu.id);
    }
    testCase[kind] = [entity];
  });
  return testCase;
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


function replaceEntity(kind, id, newEntity, entitiesMetadata, testCase) {
  var newEntities = Lazy(testCase[kind]).reject((entity) => entity.id === id).concat([newEntity]).toArray();
  var newTestCase = Lazy(testCase).assign({[kind]: newEntities}).toObject();
  if (entitiesMetadata[kind].isPersonsEntity && newEntity.id !== id) {
    // Update old references to new entity ID.
    Object.keys(testCase).forEach(entityKind => {
      if (!entitiesMetadata[entityKind].isPersonsEntity) {
        var entityData = findEntityAndRole(id, entityKind, entitiesMetadata, testCase);
        if (entityData) {
          var {entity, role} = entityData;
          var newRoleValue = isSingleton(entityKind, role, entitiesMetadata) ?
            newEntity.id :
            entity[role].map(idInRole => idInRole === id ? newEntity.id : idInRole);
          var newEntityOfKind = Lazy(entity).assign({[role]: newRoleValue}).toObject();
          newTestCase = replaceEntity(entityKind, entity.id, newEntityOfKind, entitiesMetadata, newTestCase);
        }
      }
    });
  }
  return newTestCase;
}


function withEntity(kind, newEntity, testCase) {
  var entities = kind in testCase ? testCase[kind] : [];
  var newEntities = entities.concat(newEntity);
  var newTestCase = Lazy(testCase).assign({[kind]: newEntities}).toObject();
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
  var newTestCase = replaceEntity(kind, id, newEntity, entitiesMetadata, testCase);
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
    newTestCase = replaceEntity(kind, id, newEntity, entitiesMetadata, testCase);
    return newTestCase;
  };
  if (isSingleton(kind, role, entitiesMetadata)) {
    newTestCase = removeRole();
  } else {
    var newIndividuIds = Lazy(entity[role]).without(individuId).toArray();
    if (newIndividuIds.length) {
      newEntity = Lazy(entity).assign({[role]: newIndividuIds}).toObject();
      newTestCase = replaceEntity(kind, id, newEntity, entitiesMetadata, testCase);
    } else {
      newTestCase = removeRole();
    }
  }
  return newTestCase;
}

module.exports = {
  createEntity,
  createIndividu,
  duplicateValuesOverPastYears,
  findEntity,
  findEntityAndRole,
  getEntitiesKinds,
  getInitialTestCase,
  hasRoleInEntity,
  isSingleton,
  moveIndividuInEntity,
  replaceEntity,
  withEntity,
  withIndividuInEntity,
  withoutEntity,
  withoutIndividu,
  withoutIndividuInEntity,
};
