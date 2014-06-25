/** @jsx React.DOM */
'use strict';

var param = require('node-qs-serialization').param,
  React = require('react'),
  warning = require('react/lib/warning');


var checkPositiveNumber = function(props, propName, componentName) {
  var value = props[propName];
  warning(typeof value !== 'undefined' && value !== null && value > 0,
    '%s property of component %s must be a positive number', propName, componentName);
};

var IframeVisualization = React.createClass({
  propTypes: {
    height: checkPositiveNumber,
    legislationUrl: React.PropTypes.string,
    testCaseUrl: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    width: checkPositiveNumber,
    year: checkPositiveNumber,
  },
  render: function() {
    var srcUrlParams = {
      legislation_url: this.props.legislationUrl, // jshint ignore:line
      test_case_url: this.props.testCaseUrl, // jshint ignore:line
      year: this.props.year,
    };
    var srcUrl = this.props.url + '?' + param(srcUrlParams);
    return (
      <iframe className="visualization-iframe" height={this.props.height} src={srcUrl} width={this.props.width}>
      </iframe>
    );
  },
});

module.exports = IframeVisualization;
