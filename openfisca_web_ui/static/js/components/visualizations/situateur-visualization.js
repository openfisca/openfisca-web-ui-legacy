/** @jsx React.DOM */
'use strict';

var find = require('lodash.find'),
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
  findXFromY: function(y) {
    // Works with values, not pixels.
    var points = this.props.points;
    var yIndex = sortedIndex(points, {y: y}, 'y');
    var higher = points[yIndex];
    var x;
    if (yIndex === 0) {
      x = higher.x;
    } else if (yIndex === points.length) {
      x = 99;
    } else {
      var lower = points[yIndex - 1];
      var dY = higher.y - lower.y;
      var dy = y - lower.y;
      var dX = higher.x - lower.x;
      var dx = dX * dy / dY;
      x = lower.x + dx;
    }
    return x;
  },
  findYFromX: function(x) {
    // Works with values, not pixels.
    var points = this.props.points;
    var point = find(points, {x: x});
    return point ? point.y : null;
  },
  getDefaultProps: function() {
    return {
      legendHeight: 30,
      marginRight: 10,
      xAxisHeight: 60,
      yAxisWidth: 80,
    };
  },
  render: function() {
    var revdispLabel = 'Revenu disponible';
    var xValue = this.findXFromY(this.props.value);
    var xSnapValues = range(0, 105, 5).concat(xValue).sort(function(a, b) { return a - b; });
    return (
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
            color='rgb(31, 119, 180)'
            points={this.props.points}
            pointToPixel={this.curveZonePointToPixel}
          />
          <Point
            color='rgb(166, 50, 50)'
            pointToPixel={this.curveZonePointToPixel}
            x={xValue}
            y={this.props.value}
          />
          <HoverLegend
            findYFromX={this.findYFromX}
            height={this.curveZoneHeight}
            pixelToPoint={this.curveZonePixelToPoint}
            pointToPixel={this.curveZonePointToPixel}
            width={this.curveZoneWidth}
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
    );
  },
});

module.exports = SituateurVisualization;
