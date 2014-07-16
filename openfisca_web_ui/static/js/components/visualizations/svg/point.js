/** @jsx React.DOM */
'use strict';

var React = require('react/addons');


var Point = React.createClass({
  propTypes: {
    onMouseOver: React.PropTypes.func,
    pointToPixel: React.PropTypes.func.isRequired,
    radius: React.PropTypes.number.isRequired,
    style: React.PropTypes.object,
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      defaultStyle: {
        fill: 'rgb(166, 50, 50)',
        fillOpacity: 1,
      },
      radius: 5,
    };
  },
  render: function() {
    var point = this.props.pointToPixel({x: this.props.x, y: this.props.y});
    var style = this.props.style ?
      React.addons.update(this.props.defaultStyle, {$merge: this.props.style}) :
      this.props.defaultStyle;
    return (
      <circle
        className="point"
        cx={point.x}
        cy={point.y}
        onMouseOver={this.props.onMouseOver}
        r={this.props.radius}
        style={style}
      />
    );
  }
});

module.exports = Point;
