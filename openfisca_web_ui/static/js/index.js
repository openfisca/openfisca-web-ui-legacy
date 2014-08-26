'use strict';

// Polyfills
if ( ! Array.prototype.contains) {
  Array.prototype.contains = require('es5-ext/array/#/contains');
}
if ( ! Array.prototype.flatten) {
  Array.prototype.flatten = require('es5-ext/array/#/flatten');
}
if ( ! Array.prototype.last) {
  Array.prototype.last = require('es5-ext/array/#/last');
}
require('es5-ext/string/#/starts-with/implement');

var React = require('react');

var app = require('./app');


// Enable React tab in Webkit developer tools.
global.React = React;

app.init();
