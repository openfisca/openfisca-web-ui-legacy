/** @jsx React.DOM */
'use strict';

var last = require('lodash.last'),
  range = require('lodash.range'),
  React = require('react/addons'),
  sortedIndex = require('lodash.sortedindex');

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
    height: React.PropTypes.number.isRequired,
    legendHeight: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    points: React.PropTypes.array.isRequired,
    value: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xSnapIntervalValue: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    yMaxValue: React.PropTypes.number.isRequired,
  },
  componentWillMount: function() {
    this.curveZoneHeight = this.props.height - this.props.xAxisHeight - this.props.legendHeight;
    this.curveZoneWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var lastPoints = last(this.props.points, 2);
    this.extrapolatedLastPoint = this.extrapolatePoint(lastPoints[0], lastPoints[1]);
  },
  curveZonePixelToPoint: function(pixel) {
    return {
      x: (pixel.x / this.curveZoneWidth) * this.props.xMaxValue,
      y: (1 - pixel.y / this.curveZoneHeight) * this.props.yMaxValue,
    };
  },
  curveZonePointToPixel: function(point) {
    return {
      x: (point.x / this.props.xMaxValue) * this.curveZoneWidth,
      y: (1 - point.y / this.props.yMaxValue) * this.curveZoneHeight,
    };
  },
  extrapolatePoint: function(low, high) {
    var slope = (high.y - low.y) / (high.x - low.x);
    var extrapolatedPointY = high.y + slope * (this.props.xMaxValue - high.x);
    return {x: this.props.xMaxValue, y: extrapolatedPointY};
  },
  findXFromY: function(y) {
    // Works with values, not pixels.
    var points = this.props.points.concat(this.extrapolatedLastPoint);
    var yIndex = sortedIndex(points, {y: y}, 'y');
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
    // Works with values, not pixels.
    var points = this.props.points.concat(this.extrapolatedLastPoint);
    var xIndex = sortedIndex(points, {x: x}, 'x');
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
  formatNumber: function(number) {
    return Math.floor(number) === number ? number : number.toFixed(2);
  },
  getDefaultProps: function() {
    return {
      legendHeight: 30,
      marginRight: 10,
      xAxisHeight: 60,
      yAxisWidth: 80,
    };
  },
  getInitialState: function() {
    return {snapPoint: null};
  },
  handleHoverLegendHover: function(point) {
    this.setState({snapPoint: point});
  },
  render: function() {
    var revdispLabel = 'Revenu disponible';
    var xValue = this.findXFromY(this.props.value);
    var numericSort = function(a, b) { return a - b; };
    var xSnapValues = range(0, 105, this.props.xSnapIntervalValue).concat(xValue).sort(numericSort);
    return (
      <div>
        <svg height={this.props.height} width={this.props.width}>
          <g transform={
            'translate(' + this.props.yAxisWidth + ', ' + (this.props.height - this.props.xAxisHeight) + ')'
          }>
            <VGrid
              height={this.curveZoneHeight}
              maxValue={this.props.xMaxValue}
              startStep={1}
              width={this.curveZoneWidth}
            />
            <XAxis
              height={this.props.xAxisHeight}
              label='% de la population'
              maxValue={this.props.xMaxValue}
              width={this.curveZoneWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.legendHeight + ')'}>
            <HGrid
              height={this.curveZoneHeight}
              maxValue={this.props.xMaxValue}
              startStep={1}
              width={this.curveZoneWidth}
            />
            <YAxis
              height={this.curveZoneHeight}
              label='revenu en milliers €'
              maxValue={this.props.yMaxValue}
              width={this.props.yAxisWidth}
            />
            <Curve
              points={this.props.points}
              pointToPixel={this.curveZonePointToPixel}
              style={{stroke: 'rgb(31, 119, 180)'}}
            />
            <Curve
              points={[last(this.props.points), this.extrapolatedLastPoint]}
              pointToPixel={this.curveZonePointToPixel}
              style={{
                stroke: 'rgb(31, 119, 180)',
                strokeDasharray: '5 5',
              }}
            />
            <Point
              color='rgb(166, 50, 50)'
              pointToPixel={this.curveZonePointToPixel}
              x={xValue}
              y={this.props.value}
            />
            <HoverLegend
              findYFromX={this.findYFromX}
              formatNumber={this.formatNumber}
              height={this.curveZoneHeight}
              onHover={this.handleHoverLegendHover}
              pixelToPoint={this.curveZonePixelToPoint}
              pointToPixel={this.curveZonePointToPixel}
              snapPoint={this.state.snapPoint}
              width={this.curveZoneWidth}
              xMaxValue={this.props.xMaxValue}
              xSnapValues={xSnapValues}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', 0)'}>
            <Legend color='rgb(31, 119, 180)'>{revdispLabel}</Legend>
            <g transform={'translate(' + 12 * 0.7 * revdispLabel.length + ', 0)'}>
              <Legend color='rgb(166, 50, 50)'>Votre revenu disponible</Legend>
            </g>
          </g>
        </svg>
        {
          this.state.snapPoint &&
          <p className='well' style={{textAlign: 'center'}}>
            {
              this.formatNumber(this.state.snapPoint.x) +
              ' % des français ont un revenu disponible inférieur à ' + // jshint ignore:line
              this.formatNumber(this.state.snapPoint.y) +
              ' €.' // jshint ignore:line
            }
          </p>
        }
      </div>
    );
  },
});

module.exports = SituateurVisualization;
