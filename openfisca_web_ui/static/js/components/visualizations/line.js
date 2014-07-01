/** @jsx React.DOM */
'use strict';

var React = require('react');


var Line = React.createClass({
  propTypes: {
    strokeColor: React.PropTypes.string.isRequired,
    strokeWidth: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    points: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    width: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    yMaxValue: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      strokeColor: 'rgb(31, 119, 180)',
      strokeWidth: 1.5,
    };
  },
  pointToPixel: function(x, y) {
    return {
      x: (x / this.props.xMaxValue) * this.props.width,
      y: (1 - y / this.props.yMaxValue) * this.props.height,
    };
  },
  pointsToPixelsStr: function(points) {
    return points.map(function(point) {
      var point = this.pointToPixel(point.x, point.y);
      return point.x.toString() + ',' + point.y.toString();
    }, this).join(' ');
  },
  render: function() {
    return (
      <polyline
        fill='none'
        points={this.pointsToPixelsStr(this.props.points)}
        stroke={this.props.strokeColor}
        strokeWidth={this.props.strokeWidth}
      />
    );
  }
});

module.exports = Line;
