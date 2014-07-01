/** @jsx React.DOM */
'use strict';

var find = require('lodash.find'),
  React = require('react/addons'),
  sortedIndex = require('lodash.sortedindex');

var XGrid = require('./x-grid'),
  YGrid = require('./y-grid'),
  Line = require('./line'),
  Point = require('./point'),
  vingtiles = require('../../../data/vingtiles.json'),
  XAxis = require('./x-axis'),
  YAxis = require('./y-axis');


var SituateurVisualization = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    value: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    yMaxValue: React.PropTypes.number.isRequired,
  },
  findXFromY: function(y, vingtiles) {
    var yIndex = sortedIndex(vingtiles.values, {y: y}, 'y');
    var higher = vingtiles.values[yIndex];
    var x;
    if (yIndex === 0) {
      x = higher.x;
    } else if (yIndex === vingtiles.values.length) {
      x = 99;
    } else {
      var lower = vingtiles.values[yIndex - 1];
      var dY = higher.y - lower.y;
      var dy = y - lower.y;
      var dX = higher.x - lower.x;
      var dx = dX * dy / dY;
      x = lower.x + dx;
    }
    return x;
  },
  getDefaultProps: function() {
    return {
      marginRight: 10,
      marginTop: 10,
      xAxisHeight: 60,
      yAxisWidth: 80,
    };
  },
  render: function() {
    var revdispVingtiles = find(vingtiles, {id: 'revdisp'});
    var salVingtiles = find(vingtiles, {id: 'sal'});
    var pointX = this.findXFromY(this.props.value, revdispVingtiles);
    return (
      <svg height={this.props.height} width={this.props.width}>
        <g transform={
          'translate(' + this.props.yAxisWidth + ', ' + (this.props.height - this.props.xAxisHeight) + ')'
        }>
          <XGrid
            height={this.props.height - this.props.xAxisHeight - this.props.marginTop}
            maxValue={this.props.xMaxValue}
            startStep={1}
            width={this.props.width - this.props.yAxisWidth - this.props.marginRight}
          />
          <XAxis
            height={this.props.xAxisHeight}
            label='% de la population'
            maxValue={this.props.xMaxValue}
            width={this.props.width - this.props.yAxisWidth - this.props.marginRight}
          />
        </g>
        <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
          <YGrid
            height={this.props.height - this.props.xAxisHeight - this.props.marginTop}
            maxValue={this.props.xMaxValue}
            startStep={1}
            width={this.props.width - this.props.yAxisWidth - this.props.marginRight}
          />
          <YAxis
            height={this.props.height - this.props.xAxisHeight - this.props.marginTop}
            label='revenu en milliers €'
            maxValue={this.props.yMaxValue}
            width={this.props.yAxisWidth}
          />
        </g>
        <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
          <Line
            height={this.props.height - this.props.xAxisHeight - this.props.marginTop}
            label={revdispVingtiles.key}
            name={revdispVingtiles.id}
            points={revdispVingtiles.values}
            strokeColor='rgb(31, 119, 180)'
            width={this.props.width - this.props.yAxisWidth - this.props.marginRight}
            xMaxValue={this.props.xMaxValue}
            yMaxValue={this.props.yMaxValue}
          />
          <Line
            height={this.props.height - this.props.xAxisHeight - this.props.marginTop}
            label={salVingtiles.key}
            name={salVingtiles.id}
            points={salVingtiles.values}
            strokeColor='rgb(255, 127, 14)'
            width={this.props.width - this.props.yAxisWidth - this.props.marginRight}
            xMaxValue={this.props.xMaxValue}
            yMaxValue={this.props.yMaxValue}
          />
          <Point
            height={this.props.height - this.props.xAxisHeight - this.props.marginTop}
            width={this.props.width - this.props.yAxisWidth - this.props.marginRight}
            x={pointX}
            xMaxValue={this.props.xMaxValue}
            y={this.props.value}
            yMaxValue={this.props.yMaxValue}
          />
        </g>
      </svg>
    );
  },
});

module.exports = SituateurVisualization;
