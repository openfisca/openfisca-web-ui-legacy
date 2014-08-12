/** @jsx React.DOM */
'use strict';

var React = require('react');


var Link = React.createClass({
  propTypes: {
    children: React.PropTypes.string.isRequired,
    color: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return {
      color: '#2a6496',
    };
  },
  getInitialState: function() {
    return {hovered: false};
  },
  handleMouseOut: function() {
    this.setState({hovered: false});
  },
  handleMouseOver: function() {
    this.setState({hovered: true});
  },
  render: function() {
    return this.transferPropsTo(
      <text
        onClick={this.props.onClick}
        onMouseOut={this.handleMouseOut}
        onMouseOver={this.handleMouseOver}
        style={{
          cursor: 'pointer',
          fill: this.props.color,
          textDecoration: this.state.hovered ? 'underline' : null,
        }}>
        {this.props.children}
      </text>
    );
  }
});

module.exports = Link;
