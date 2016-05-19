

var Lazy = require('lazy.js');


function assignIn(object, crumbs, value) {
  /*
  Example:
    assignIn(null, ['person', 'name'], 'Bob')
      => {person: {name: 'Bob'}}
    var bob = {person: {name: 'Bob'}};
    assignIn(bob, ['person', 'age'], 32)
      => {person: {age: 32, name: 'Bob'}}
  */
  var assignCrumb = function(node, crumbIndex) {
    if (crumbIndex < crumbs.length) {
      var crumb = crumbs[crumbIndex];
      return Lazy(node).assign({[crumb]: assignCrumb(node[crumb], crumbIndex + 1)}).toObject();
    } else {
      return value;
    }
  };
  return assignCrumb(object, 0);
}


function formatFrenchNumber(value, {fixed, round} = {}) {
  if (typeof fixed === 'undefined') {
    fixed = false;
  }
  if (typeof round === 'undefined') {
    round = true;
  }
  var roundedNumber = Math.round(value);
  var formattedValue = fixed !== false ?
    value.toFixed(fixed) :
    (round && (Math.abs(value) === 0 || Math.abs(value) > 10) ? roundedNumber : value.toFixed(2));
  return formattedValue.toLocaleString('fr');
}


function getObjectPath(object /*, keys... */) {
  /*
  Based on get-object-path npm module which unfortunately only accepts path as string.
  Example:
    getObjectPath(null, 'person', 'name')
      => undefined
    var errors = {person: {name: 'invalid value'}};
    getObjectPath(errors, 'person', 'name')
      => 'invalid value'
  */
  if (typeof object === 'undefined' || object === null) {
    return undefined;
  }
  var crumbs = Array.prototype.slice.call(arguments, 1);
  var i = -1;
  var result;
  while (++i < crumbs.length) {
    if (i === 0) result = object;
    if (!crumbs[i]) continue;
    if (result === undefined) break;
    result = result[crumbs[i]];
  }
  return result;
}


module.exports = {assignIn, formatFrenchNumber, getObjectPath};
