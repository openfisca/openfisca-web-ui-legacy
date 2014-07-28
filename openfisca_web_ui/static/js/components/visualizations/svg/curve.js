/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons');


var Curve = React.createClass({
  propTypes: {
    points: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    pointToPixel: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
  },
  getDefaultProps: function() {
    return {
      defaultStyle: {
        fill: 'none',
        stroke: 'rgb(31, 119, 180)',
        strokeWidth: 1.5,
      }
    };
  },
  pointsToPixelsStr: function(points) {
    return points.map(function(point) {
      var pixel = this.props.pointToPixel(point);
      return pixel.x.toString() + ',' + pixel.y.toString();
    }.bind(this)).join(' ');
  },
  render: function() {
    var style = Lazy(this.props.style).defaults(this.props.defaultStyle).toObject();
    var pixelsStr = this.pointsToPixelsStr(this.props.points);
    return (
      <polyline points={pixelsStr} style={style} />
    );
  }
});

module.exports = Curve;
