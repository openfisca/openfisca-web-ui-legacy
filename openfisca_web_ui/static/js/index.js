'use strict';

var $ = require('jquery'),
  React = require('react');

var appconfig = global.appconfig;

global.jQuery = $; // Bootstrap needs global jQuery.

if (appconfig && appconfig.debug) {
  // Enable React tab in Webkit developer tools.
  global.React = React;
}

// Load app after setting global variables.
var app = require('./app');
app.init();
