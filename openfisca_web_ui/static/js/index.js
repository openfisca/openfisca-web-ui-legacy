'use strict';

var $ = require('jquery'),
  React = require('react');

var app = require('./app');


// Enable React tab in Webkit developer tools.
global.React = React;

app.init();
