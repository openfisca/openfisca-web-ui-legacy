'use strict';

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
      return Lazy(node).assign(
        obj(crumb, assignCrumb(node[crumb], crumbIndex + 1))
      ).toObject();
    } else {
      return value;
    }
  };
  return assignCrumb(object, 0);
}


function formatFrenchNumber(number, options) {
  var opts = Lazy(options).defaults({round: true}).toObject();
  var roundedNumber = Math.round(number);
  var formattedNumber = opts.fixed ?
    number.toFixed(opts.fixed) :
    (opts.round && Math.abs(number) > 10 ? roundedNumber : number.toFixed(2));
  return formattedNumber.toLocaleString('fr');
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


function obj() {
  /*
  In JavaScript objects cannot be initialized with a key which is a variable.
  Example:
    obj('a', 1, 'b', 2)
      => {a: 1, b: 2}
    var kind = 'familles';
    obj(kind, 1)
      => {familles: 1}
  */
  return Lazy(Array.prototype.slice.call(arguments)).chunk(2).toObject();
}


module.exports = {
  assignIn: assignIn,
  formatFrenchNumber: formatFrenchNumber,
  getObjectPath: getObjectPath,
  obj: obj,
};
