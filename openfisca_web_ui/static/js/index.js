'use strict';

// Polyfills
require('es5-extend').call(global);

var React = require('react');

var app = require('./app');


// Enable React tab in Webkit developer tools.
global.React = React;

app.init();
