/** @jsx React.DOM */
'use strict';

var React = require('react'),
  values = require('lodash.values');


var CerfaField = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired,
  },
  render: function() {
    var areMultipleValues = typeof this.props === 'object';
    return (
      <span className="help-block">
        {areMultipleValues ? 'Cases' : 'Case'} CERFA
        {areMultipleValues ? values(this.props.value).join(', ') : this.props.value}}
      </span>
    );
  }
});

module.exports = CerfaField;
