'use strict';

var React = require('react');

require('./polyfills');

var app = require('./app');


// Enable React tab in Webkit developer tools.
global.React = React;

app.init();
