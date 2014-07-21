'use strict';

var Lazy = require('lazy.js');


var getObjectPath = function(context) {
  /*
  Based on get-object-path npm module which unfortunately only accepts path as string.
  Example:
    getObjectPath(null, 'person', 'name')
      => undefined
    var errors = {person: {name: 'invalid value'}};
    getObjectPath(errors, 'person', 'name')
      => 'invalid value'
  */
  if (typeof context === 'undefined' || context === null) {
    return undefined;
  }
  var crumbs = Array.prototype.slice.call(arguments, 1);
  var i = -1;
  var result;
  while (++i < crumbs.length) {
    if (i === 0) result = context;
    if (!crumbs[i]) continue;
    if (result === undefined) break;
    result = result[crumbs[i]];
  }
  return result;
};


var obj = function() {
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
};


module.exports = {
  getObjectPath: getObjectPath,
  obj: obj,
};
