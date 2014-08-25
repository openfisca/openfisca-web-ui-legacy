/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react');


var Tooltip = React.createClass({
  propTypes: {
    children: React.PropTypes.component.isRequired,
    placement: React.PropTypes.string,
  },
  componentDidMount: function() {
    $(this.getDOMNode()).tooltip({placement: this.props.placement});
  },
  componentDidUpdate: function() {
    $(this.getDOMNode()).tooltip('fixTitle');
  },
  render: function() {
    return this.props.children;
  }
});

module.exports = Tooltip;
