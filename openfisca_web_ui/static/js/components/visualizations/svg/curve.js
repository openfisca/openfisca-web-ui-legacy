/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var Curve = React.createClass({
  propTypes: {
    active: React.PropTypes.bool,
    fill: React.PropTypes.bool,
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
    var style = this.props.fill ? {
      fill: 'rgb(31, 119, 180)',
    } : {
      fill: 'none',
      strokeWidth: 1.5,
    };
    return Lazy(style).assign({
      stroke: 'rgb(31, 119, 180)',
    }).toObject();
  },
  pointsToPixelsStr: function(points) {
    return points.map(point => {
      var pixel = this.props.pointToPixel(point);
      return `${pixel.x},${pixel.y}`;
    }).join(' ');
  },
  render: function() {
    var style = Lazy(this.props.style).defaults(this.defaultStyle()).toObject();
    if (this.props.active) {
      style = Lazy(style).assign({stroke: 'black', strokeWidth: 2}).toObject();
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
