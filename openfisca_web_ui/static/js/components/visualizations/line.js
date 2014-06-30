/** @jsx React.DOM */
'use strict';

var React = require('react');


var Line = React.createClass({
  propTypes: {
    strokeColor: React.PropTypes.string,
    strokeWidth: React.PropTypes.number,
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
      height: 100,
      strokeColor: 'blue',
      strokeWidth: 2,
      width: 100,
      xMaxValue: 100,
      yMaxValue: 100,
    };
  },
  pointsToPixels: function() {
    return this.props.points.map(function(point) {
      var x = (point.x / this.props.xMaxValue) * this.props.width,
        y = (1 - point.y / this.props.yMaxValue) * this.props.height;
      return x.toString() + ',' + y.toString();
    }, this).join(' ');
  },
  render: function() {
    return (
      <polyline
        fill='none'
        points={this.pointsToPixels()}
        stroke={this.props.strokeColor}
        strokeWidth={this.props.strokeWidth}
      />
    );
  }
});

module.exports = Line;
