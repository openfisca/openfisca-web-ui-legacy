/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react'),
  strformat = require('strformat');


var CerfaField = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired,
  },
  render: function() {
    var areMultipleValues = typeof this.props === 'object';
    return (
      <span className="help-block">
        {
          areMultipleValues ?
            strformat('Cases CERFA {0}', Lazy(this.props.value).join(', ')) :
            strformat('Case CERFA {0}', this.props.value)
        }
      </span>
    );
  }
});

module.exports = CerfaField;
