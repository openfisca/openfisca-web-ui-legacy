/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  React = require('react'),
  sortedIndex = require('lodash.sortedindex');


var HoverLegend = React.createClass({
  propTypes: {
    findYFromX: React.PropTypes.func.isRequired,
    fontSize: React.PropTypes.number.isRequired,
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    lineColor: React.PropTypes.string.isRequired,
    lineStrokeWidth: React.PropTypes.number.isRequired,
    onHover: React.PropTypes.func.isRequired,
    pixelToPoint: React.PropTypes.func.isRequired,
    pointToPixel: React.PropTypes.func.isRequired,
    snapPoint: React.PropTypes.shape({
      x: React.PropTypes.number.isRequired,
      y: React.PropTypes.number.isRequired,
    }),
    width: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
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
  getDefaultProps: function() {
    return {
      fontSize: 12,
      lineColor: 'black',
      lineStrokeWidth: 1,
    };
  },
  handleMouseMove: function(event) {
    var clientPixel = {x: event.clientX, y: event.clientY};
    var localPixel = this.clientPixelToLocalPixel(clientPixel);
    var point = this.props.pixelToPoint(localPixel);
    var snapX = this.snapXValue(point.x);
    var snapY = this.props.findYFromX(snapX);
    var snapPoint = {x: snapX, y: snapY};
    this.props.onHover(snapPoint);
  },
  handleMouseOut: function() {
    this.props.onHover(null);
  },
  render: function() {
    var elements = [];
    if (this.props.snapPoint) {
      var snapPixel = this.props.pointToPixel(this.props.snapPoint);
      var lineStyle = {
        stroke: this.props.lineColor,
        strokeDasharray: '5 5',
        strokeWidth: this.props.lineStrokeWidth,
        shapeRendering: 'crispedges',
      };
      elements = elements.concat([
        <line
          key='v-line'
          style={lineStyle}
          x1={snapPixel.x}
          x2={snapPixel.x}
          y1={0}
          y2={this.props.height}
        />,
        <line
          key='h-line'
          style={lineStyle}
          x1={0}
          x2={this.props.width}
          y1={snapPixel.y}
          y2={snapPixel.y}
        />
      ]);
      var isLastXValue = this.props.snapPoint.x === this.props.xMaxValue;
      if (this.props.snapPoint.x) {
        elements.push(
          <text
            key='x-text'
            style={{
              cursor: 'default',
              fontSize: this.props.fontSize,
              textAnchor: isLastXValue ? 'end' : 'start',
            }}
            x={isLastXValue ? snapPixel.x - 5 : snapPixel.x + 5}
            y={this.props.height - this.props.fontSize}>
            {this.props.formatNumber(this.props.snapPoint.x)}
          </text>
        );
      }
      if (this.props.snapPoint.y) {
        elements.push(
          <text
            key='y-text'
            style={{
              cursor: 'default',
              fontSize: this.props.fontSize,
              textAnchor: 'start',
            }}
            x={10}
            y={snapPixel.y - 5}>
            {this.props.formatNumber(this.props.snapPoint.y)}
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
    invariant(xValue <= this.props.xMaxValue, 'xValue is greater than xMaxValue (%s > %s)',
      xValue, this.props.xMaxValue);
    var index = sortedIndex(this.props.xSnapValues, xValue);
    var low = this.props.xSnapValues[index - 1],
      high = this.props.xSnapValues[index];
    return low + Math.round((xValue - low) / (high - low)) * (high - low);
  },
});

module.exports = HoverLegend;
