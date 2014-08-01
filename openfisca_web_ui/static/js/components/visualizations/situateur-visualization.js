/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react'),
  strformat = require('strformat');

var Curve = require('./svg/curve'),
  HGrid = require('./svg/h-grid'),
  HoverLegend = require('./svg/hover-legend'),
  Legend = require('./svg/legend'),
  Point = require('./svg/point'),
  VGrid = require('./svg/v-grid'),
  XAxis = require('./svg/x-axis'),
  YAxis = require('./svg/y-axis');


var SituateurVisualization = React.createClass({
  propTypes: {
    curveLabel: React.PropTypes.string.isRequired,
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    hintFormat: React.PropTypes.string.isRequired,
    legendHeight: React.PropTypes.number.isRequired,
    pointLabel: React.PropTypes.string.isRequired,
    points: React.PropTypes.array.isRequired,
    value: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xSnapIntervalValue: React.PropTypes.number.isRequired,
    xSteps: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    yMaxValue: React.PropTypes.number.isRequired,
    yNbSteps: React.PropTypes.number.isRequired,
  },
  extrapolatePoint: function(low, high) {
    var slope = (high.y - low.y) / (high.x - low.x);
    var extrapolatedPointY = high.y + slope * (this.props.xMaxValue - high.x);
    return {x: this.props.xMaxValue, y: extrapolatedPointY};
  },
  findXFromY: function(y) {
    var points = this.props.points.concat(this.extrapolatedLastPoint);
    var yIndex = Lazy(points).pluck('y').sortedIndex(y);
    var high = points[yIndex];
    var x;
    if (yIndex === 0) {
      x = high.x;
    } else if (yIndex === points.length) {
      x = this.props.xMaxValue;
    } else {
      var low = points[yIndex - 1];
      var dY = high.y - low.y;
      var dy = y - low.y;
      var dX = high.x - low.x;
      var dx = dX * dy / dY;
      x = low.x + dx;
    }
    return x;
  },
  findYFromX: function(x) {
    var points = this.props.points.concat(this.extrapolatedLastPoint);
    var xIndex = Lazy(points).pluck('x').sortedIndex(x);
    var high = points[xIndex];
    var y;
    if (xIndex === 0) {
      y = high.y;
    } else if (xIndex === points.length) {
      y = this.extrapolatedLastPoint.y;
    } else {
      var low = points[xIndex - 1];
      var dX = high.x - low.x;
      var dx = x - low.x;
      var dY = high.y - low.y;
      var dy = dY * dx / dX;
      y = low.y + dy;
    }
    return y;
  },
  formatHint: function(point) {
    return strformat(this.props.hintFormat, {
      amount: this.props.formatNumber(point.y),
      percent: this.props.formatNumber(point.x),
    });
  },
  getDefaultProps: function() {
    return {
      legendHeight: 30,
      marginRight: 5,
      xAxisHeight: 60,
      xMaxValue: 100,
      xSteps: 10,
      yAxisWidth: 80,
      yNbSteps: 10,
    };
  },
  getInitialState: function() {
    return {
      snapPoint: null,
    };
  },
  gridPixelToPoint: function(pixel) {
    return {
      x: (pixel.x / this.gridWidth) * this.props.xMaxValue,
      y: (1 - pixel.y / this.gridHeight) * this.props.yMaxValue,
    };
  },
  gridPointToPixel: function(point) {
    return {
      x: (point.x / this.props.xMaxValue) * this.gridWidth,
      y: (1 - point.y / this.props.yMaxValue) * this.gridHeight,
    };
  },
  handleHoverLegendHover: function(point) {
    this.setState({snapPoint: point});
  },
  render: function() {
    this.gridHeight = this.props.height - this.props.xAxisHeight - this.props.legendHeight;
    this.gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var lastPoints = Lazy(this.props.points).last(2).toArray();
    this.extrapolatedLastPoint = this.extrapolatePoint(lastPoints[0], lastPoints[1]);
    var xValue = this.findXFromY(this.props.value);
    var xSnapValues = Lazy.range(0, 105, this.props.xSnapIntervalValue).concat(xValue).sort().toArray();
    return (
      <div>
        <svg height={this.props.height} width={this.props.width}>
          <g transform={
            'translate(' + this.props.yAxisWidth + ', ' + (this.props.height - this.props.xAxisHeight) + ')'
          }>
            <HGrid
              height={this.gridHeight}
              nbSteps={this.props.yNbSteps}
              startStep={1}
              width={this.gridWidth}
            />
            <XAxis
              formatNumber={this.props.formatNumber}
              height={this.props.xAxisHeight}
              label='% de la population'
              maxValue={this.props.xMaxValue}
              width={this.gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.legendHeight + ')'}>
            <VGrid
              height={this.gridHeight}
              nbSteps={this.props.xSteps}
              startStep={1}
              width={this.gridWidth}
            />
            <YAxis
              formatNumber={this.props.formatNumber}
              height={this.gridHeight}
              label='en €'
              maxValue={this.props.yMaxValue}
              nbSteps={this.props.yNbSteps}
              width={this.props.yAxisWidth}
            />
            <Curve
              points={this.props.points}
              pointToPixel={this.gridPointToPixel}
              style={{stroke: 'rgb(31, 119, 180)'}}
            />
            <Curve
              points={[Lazy(this.props.points).last(), this.extrapolatedLastPoint]}
              pointToPixel={this.gridPointToPixel}
              style={{
                stroke: 'rgb(31, 119, 180)',
                strokeDasharray: '5 5',
              }}
            />
            <Point
              color='rgb(166, 50, 50)'
              pointToPixel={this.gridPointToPixel}
              x={xValue}
              y={this.props.value}
            />
            <HoverLegend
              findYFromX={this.findYFromX}
              formatNumber={this.props.formatNumber}
              height={this.gridHeight}
              onHover={this.handleHoverLegendHover}
              pixelToPoint={this.gridPixelToPoint}
              pointToPixel={this.gridPointToPixel}
              snapPoint={this.state.snapPoint}
              width={this.gridWidth}
              xMaxValue={this.props.xMaxValue}
              xSnapValues={xSnapValues}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', 0)'}>
            <Legend color='rgb(31, 119, 180)'>{this.props.curveLabel}</Legend>
            <g transform={'translate(' + 12 * 0.7 * this.props.curveLabel.length + ', 0)'}>
              <Legend color='rgb(166, 50, 50)'>{this.props.pointLabel}</Legend>
            </g>
          </g>
        </svg>
        {
          <p className='well' style={{textAlign: 'center'}}>
            {this.formatHint(this.state.snapPoint || {x: this.findXFromY(this.props.value), y: this.props.value})}
          </p>
        }
      </div>
    );
  },
});

module.exports = SituateurVisualization;
