/** @jsx React.DOM */
'use strict';

var React = require('react');


var HoverBar = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    onMouseOut: React.PropTypes.func.isRequired,
    onMouseOver: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired,
    x: React.PropTypes.number.isRequired,
  },
  render: function() {
    return (
      <rect
        height={this.props.height}
        onMouseOut={this.props.onMouseOut}
        onMouseOver={this.props.onMouseOver}
        style={{opacity: 0}}
        width={this.props.width}
        x={this.props.x}
        y={0}
      />
    );
  }
});

module.exports = HoverBar;
