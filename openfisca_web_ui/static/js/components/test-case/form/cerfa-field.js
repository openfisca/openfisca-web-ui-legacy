/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var CerfaField = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired,
  },
  render: function() {
    var areMultipleValues = typeof this.props.value === 'object';
    var helpMessage = areMultipleValues ?
      `Cases CERFA ${Lazy(this.props.value).join(', ')}` :
      `Case CERFA ${this.props.value}`;
    return <span className="help-block">{helpMessage}</span>;
  }
});

module.exports = CerfaField;
