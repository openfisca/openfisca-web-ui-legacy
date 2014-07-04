/** @jsx React.DOM */
'use strict';

var React = require('react');


var Curve = React.createClass({
  propTypes: {
    color: React.PropTypes.string.isRequired,
    points: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    pointToPixel: React.PropTypes.func.isRequired,
    strokeWidth: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      color: 'rgb(31, 119, 180)',
      strokeWidth: 1.5,
    };
  },
  pointsToPixelsStr: function(points) {
    return points.map(function(point) {
      var point = this.props.pointToPixel(point);
      return point.x.toString() + ',' + point.y.toString();
    }, this).join(' ');
  },
  render: function() {
    return (
      <polyline
        fill='none'
        points={this.pointsToPixelsStr(this.props.points)}
        stroke={this.props.color}
        strokeWidth={this.props.strokeWidth}
      />
    );
  }
});

module.exports = Curve;
