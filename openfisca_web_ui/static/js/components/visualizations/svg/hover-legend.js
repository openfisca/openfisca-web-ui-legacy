/** @jsx React.DOM */
'use strict';

var React = require('react'),
  sortedIndex = require('lodash.sortedindex');


var HoverLegend = React.createClass({
  propTypes: {
    findYFromX: React.PropTypes.func.isRequired,
    fontSize: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    lineColor: React.PropTypes.string.isRequired,
    pixelToPoint: React.PropTypes.func.isRequired,
    pointToPixel: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired,
    xSnapValues: React.PropTypes.array.isRequired,
  },
  clientPixelToLocalPixel: function(clientPixel) {
    var boundingClientRect = this.getDOMNode().getBoundingClientRect();
    var localPixel = {
      x: clientPixel.x - boundingClientRect.left,
      y: clientPixel.y - boundingClientRect.top,
    };
    return localPixel;
  },
  formatNumber: function(number) {
    return Math.floor(number) === number ? number : number.toFixed(2);
  },
  getDefaultProps: function() {
    return {
      fontSize: 12,
      lineColor: '#e5e5e5',
    };
  },
  getInitialState: function() {
    return {mouse: null};
  },
  handleMouseMove: function(event) {
    var clientPixel = {x: event.clientX, y: event.clientY};
    var localPixel = this.clientPixelToLocalPixel(clientPixel);
    this.setState({mouse: localPixel});
  },
  handleMouseOut: function() {
    this.setState(this.getInitialState());
  },
  render: function() {
    var elements = [];
    if (this.state.mouse) {
      var point = this.props.pixelToPoint(this.state.mouse);
      var snappedX = this.snapXValue(point.x);
      var snappedY = this.props.findYFromX(snappedX);
      var snappedPoint = {x: snappedX, y: snappedY};
      var snappedPixel = this.props.pointToPixel(snappedPoint);
      elements = elements.concat([
        <line
          key='v-line'
          stroke={this.props.lineColor}
          strokeWidth={1.5}
          x1={snappedPixel.x}
          x2={snappedPixel.x}
          y1={0}
          y2={this.props.height}
        />,
        <line
          key='h-line'
          stroke={this.props.lineColor}
          strokeWidth={1.5}
          x1={0}
          x2={this.props.width}
          y1={snappedPixel.y}
          y2={snappedPixel.y}
        />
      ]);
      if (snappedPoint.x) {
        elements.push(
          <text
            key='x-text'
            style={{cursor: 'default', fontSize: this.props.fontSize, textAnchor: 'middle'}}
            x={snappedPixel.x}
            y={this.props.height - this.props.fontSize}>
            {this.formatNumber(snappedPoint.x)}
          </text>
        );
      }
      if (snappedPoint.y) {
        elements.push(
          <text
            key='y-text'
            style={{cursor: 'default', fontSize: this.props.fontSize, textAnchor: 'start'}}
            x={10}
            y={snappedPixel.y - 5}>
            {this.formatNumber(snappedPoint.y)}
          </text>
        );
      }
    }
    elements.push(
      <rect
        key='rect'
        height={this.props.height}
        onMouseMove={this.handleMouseMove}
        onMouseOut={this.handleMouseOut}
        style={{opacity: 0}}
        width={this.props.width}
        x={0}
        y={0}
      />
    );
    return (
      <g>
        {elements}
      </g>
    );
  },
  snapXValue: function(xValue) {
    var index = sortedIndex(this.props.xSnapValues, xValue);
    var low = this.props.xSnapValues[index - 1],
      high = this.props.xSnapValues[index];
    return low + Math.round((xValue - low) / (high - low)) * (high - low);
  },
});

module.exports = HoverLegend;
