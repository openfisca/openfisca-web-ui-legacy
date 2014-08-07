/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react'),
  strformat = require('strformat');


var Curve = React.createClass({
  propTypes: {
    active: React.PropTypes.bool.isRequired,
    fill: React.PropTypes.bool.isRequired,
    onHover: React.PropTypes.func,
    points: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    pointToPixel: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
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
  pointsToPixelsStr: function(points) {
    return points.map(function(point) {
      var pixel = this.props.pointToPixel(point);
      return strformat('{x},{y}', pixel);
    }.bind(this)).join(' ');
  },
  render: function() {
    var style = Lazy(this.props.style).defaults(this.defaultStyle()).toObject();
    if (this.props.active) {
      var changeset = this.props.fill ? {fill: 'gray', opacity: 1} : {strokeWidth: 3};
      style = Lazy(style).assign(changeset).toObject();
    }
    return (
      <polyline
        onMouseOut={this.props.onHover}
        onMouseOver={this.props.onHover}
        points={this.pointsToPixelsStr(this.props.points)}
        style={style}
      />
    );
  }
});

module.exports = Curve;
