/** @jsx React.DOM */
'use strict';

var React = require('react');


var Point = React.createClass({
  propTypes: {
    color: React.PropTypes.string.isRequired,
    onMouseOver: React.PropTypes.func,
    pointToPixel: React.PropTypes.func.isRequired,
    radius: React.PropTypes.number.isRequired,
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      color: 'rgb(166, 50, 50)',
      radius: 5,
    };
  },
  render: function() {
    var point = this.props.pointToPixel({x: this.props.x, y: this.props.y});
    return (
      <circle
        className="point"
        cx={point.x}
        cy={point.y}
        onMouseOver={this.props.onMouseOver}
        r={this.props.radius}
        style={{
          fill: this.props.color,
          fillOpacity: 1,
        }}
      />
    );
  }
});

module.exports = Point;
