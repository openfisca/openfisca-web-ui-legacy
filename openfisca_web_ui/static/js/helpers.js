'use strict';

var _ = require('underscore');


function findDeep(items, attrs) {
  function match(value) {
    for (var key in attrs) {
      if (attrs[key] !== value[key]) {
        return false;
      }
    }
    return true;
  }
  function traverse(value) {
    var result;
    if (match(value)) {
      return value;
    }
    _.forEach(value.children, function (val) {
      if (result) {
        return false;
      }
      if (match(val)) {
        result = val;
        return false;
      }
      if (_.isObject(val.children) || _.isArray(val.children)) {
        result = traverse(val);
      }
    });
    return result;
  }
  return traverse(items);
}

module.exports = {findDeep: findDeep};
