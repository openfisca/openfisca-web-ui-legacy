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
    }, this).join(' ');
  },
  render: function() {
    var style = this.props.style ?
      Lazy(this.props.style).defaults(this.props.defaultStyle).toObject() :
      this.props.defaultStyle;
    return (
      <polyline points={this.pointsToPixelsStr(this.props.points)} style={style} />
    );
  }
});

module.exports = Curve;
