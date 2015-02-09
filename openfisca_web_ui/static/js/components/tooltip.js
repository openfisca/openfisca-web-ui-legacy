/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react');


var Tooltip = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    placement: React.PropTypes.string,
  },
  componentDidMount() {
    $(this.getDOMNode()).tooltip({placement: this.props.placement});
  },
  componentDidUpdate() {
    $(this.getDOMNode()).tooltip('fixTitle');
  },
  render() {
    return this.props.children;
  }
});

module.exports = Tooltip;
