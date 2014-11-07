'use strict';

var React = require('react');

var app = require('./app'),
  polyfills = require('./polyfills');


// Enable React tab in Webkit developer tools.
global.React = React;

polyfills.install();

app.init();
