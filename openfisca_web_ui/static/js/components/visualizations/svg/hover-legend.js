/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react');


var HoverLegend = React.createClass({
  propTypes: {
    fontSize: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    lineColor: React.PropTypes.string.isRequired,
    lineStrokeWidth: React.PropTypes.number.isRequired,
    onHover: React.PropTypes.func.isRequired,
    pixelToPoint: React.PropTypes.func.isRequired,
    pointToPixel: React.PropTypes.func.isRequired,
    pointsXMaxValue: React.PropTypes.number.isRequired,
    snapPoint: React.PropTypes.shape({
      x: React.PropTypes.number.isRequired,
      y: React.PropTypes.number.isRequired,
    }),
    width: React.PropTypes.number.isRequired,
    xFormatNumber: React.PropTypes.func.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xSnapValues: React.PropTypes.array.isRequired,
    yFormatNumber: React.PropTypes.func.isRequired,
  },
  clientPixelToLocalPixel(clientPixel) {
    var boundingClientRect = this.getDOMNode().getBoundingClientRect();
    var localPixel = {
      x: Math.max(0, clientPixel.x - boundingClientRect.left),
      y: Math.max(clientPixel.y - boundingClientRect.top),
    };
    return localPixel;
  },
  getDefaultProps() {
    return {
      fontSize: 12,
      lineColor: 'black',
      lineStrokeWidth: 1,
    };
  },
  handleMouseMove(event) {
    var clientPixel = {x: event.clientX, y: event.clientY};
    var localPixel = this.clientPixelToLocalPixel(clientPixel);
    var point = this.props.pixelToPoint(localPixel);
    var snapX = point.x === 0 ? 0 : this.snapXValue(point.x);
    this.props.onHover(snapX);
  },
  handleMouseOut() {
    this.props.onHover(null);
  },
  render() {
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
            {
              this.props.snapPoint.x === this.props.xMaxValue || this.props.snapPoint.x <= this.props.pointsXMaxValue ?
                this.props.xFormatNumber(this.props.snapPoint.x) + ' %' :
                '?'
            }
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
            {
              this.props.snapPoint.x < this.props.xMaxValue ?
                this.props.yFormatNumber(this.props.snapPoint.y) + ' €' :
                '?'
            }
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
  snapXValue(xValue) {
    invariant(xValue <= this.props.xMaxValue, 'xValue is greater than xMaxValue (%s > %s)',
      xValue, this.props.xMaxValue);
    var index = Lazy(this.props.xSnapValues).sortedIndex(xValue);
    var low = this.props.xSnapValues[index - 1],
      high = this.props.xSnapValues[index];
    return low + Math.round((xValue - low) / (high - low)) * (high - low);
  },
});

module.exports = HoverLegend;
