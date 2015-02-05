'use strict';

var React = require('react');

var app = require('./app');


// Enable React tab in Webkit developer tools.
global.React = React;

// Polyfills
var raf = require('raf');
if ( ! window.requestAnimationFrame) {
  window.requestAnimationFrame = raf;
}


app.init();
