/** @jsx React.DOM */
'use strict';

var React = require('react');


var Point = React.createClass({
  propTypes: {
    color: React.PropTypes.string.isRequired,
    height: React.PropTypes.number.isRequired,
    x: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    yMaxValue: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      color: 'rgb(166, 50, 50)',
    };
  },
  pointToPixel: function(x, y) {
    return {
      x: (x / this.props.xMaxValue) * this.props.width,
      y: (y / this.props.yMaxValue) * this.props.height,
    };
  },
  render: function() {
    var point = this.pointToPixel(this.props.x, this.props.y);
    return (
      <circle
        className="point"
        r={5}
        cx={point.x}
        cy={this.props.height - point.y}
        style={{
          fill: this.props.color,
          fillOpacity: 1,
        }}
      />
    );
  }
});

module.exports = Point;
