/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react'),
  strformat = require('strformat');


var Curve = React.createClass({
  propTypes: {
    fill: React.PropTypes.bool.isRequired,
    points: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    pointToPixel: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
    xMaxValue: React.PropTypes.number,
    xMinValue: React.PropTypes.number,
    yMinValue: React.PropTypes.number,
  },
  defaultStyle: function() {
    return this.props.fill ? {
      fill: 'rgb(31, 119, 180)',
      opacity: 0.6,
    } : {
      fill: 'none',
      stroke: 'rgb(31, 119, 180)',
      strokeWidth: 1.5,
    };
  },
  getDefaultProps: function() {
    return {
      fill: false,
    };
  },
  pointsToPixelsStr: function(points) {
    return points.map(function(point) {
      var pixel = this.props.pointToPixel(point);
      return strformat('{x},{y}', pixel);
    }.bind(this)).join(' ');
  },
  render: function() {
    var style = Lazy(this.props.style).defaults(this.defaultStyle()).toObject();
    invariant(
      ! this.props.fill || this.props.xMaxValue && this.props.xMinValue && this.props.yMinValue,
      'xMaxValue, xMinValue and yMinValue props must be given when fill prop is true.'
    );
    this.points = this.props.fill ?
      Lazy([{x: this.props.xMinValue, y: this.props.yMinValue}])
        .concat(this.props.points)
        .concat({x: this.props.xMaxValue, y: this.props.yMinValue})
        .toArray() :
      this.props.points;
    var pixelsStr = this.pointsToPixelsStr(this.points);
    return (
      <polyline points={pixelsStr} style={style} />
    );
  }
});

module.exports = Curve;
