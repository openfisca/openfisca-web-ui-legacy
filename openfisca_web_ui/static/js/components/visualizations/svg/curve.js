/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react');


var Curve = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    fill: React.PropTypes.bool,
    onHover: React.PropTypes.func,
    points: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
      })
    ).isRequired,
    pointToPixel: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
  },
  defaultStyle() {
    var style = this.props.fill ? {
      fill: 'rgb(31, 119, 180)',
    } : {
      fill: 'none',
      strokeWidth: 4,
    };
    return Lazy(style).assign({
      stroke: 'rgb(31, 119, 180)',
    }).toObject();
  },
  pointsToPixelsStr(points) {
    return points.map(point => {
      var pixel = this.props.pointToPixel(point);
      invariant( ! isNaN(pixel.x), 'pixel.x is NaN');
      invariant( ! isNaN(pixel.y), 'pixel.y is NaN');
      return `${pixel.x},${pixel.y}`;
    }).join(' ');
  },
  render() {
    var style = Lazy(this.props.style).defaults(this.defaultStyle()).toObject();
    return (
      <polyline
        className={this.props.className}
        onMouseOut={this.props.onHover}
        onMouseOver={this.props.onHover}
        points={this.pointsToPixelsStr(this.props.points)}
        style={style}
      />
    );
  }
});

module.exports = Curve;
