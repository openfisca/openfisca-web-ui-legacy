/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var HGrid = require('./svg/h-grid'),
  VGrid = require('./svg/v-grid'),
  XAxis = require('./svg/x-axis'),
  YAxis = require('./svg/y-axis');


var BaremeVisualization = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xSteps: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    ySteps: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      marginRight: 10,
      marginTop: 30,
      xAxisHeight: 100,
      xMaxValue: 100,
      yAxisWidth: 80,
      xSteps: 10,
      ySteps: 8,
    };
  },
  render: function() {
    this.gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop;
    this.gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var xStepWidth = this.gridWidth / this.props.xSteps;
    var xStepsPositions = Lazy.range(1, this.props.xSteps + 1)
      .map(function(value) { return value * xStepWidth; })
      .toArray();
    var yMaxValue = 100000;
    return (
      <div>
        <svg height={this.props.height} width={this.props.width}>
          <g transform={
            'translate(' + this.props.yAxisWidth + ', ' + (this.props.height - this.props.xAxisHeight) + ')'
          }>
            <HGrid
              height={this.gridHeight}
              nbSteps={this.props.ySteps}
              startStep={1}
              width={this.gridWidth}
            />
            <XAxis
              height={this.props.xAxisHeight}
              label='TODO'
              maxValue={this.props.xMaxValue}
              width={this.gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
            <VGrid height={this.gridHeight} stepsPositions={xStepsPositions} />
            <YAxis
              height={this.gridHeight}
              label='milliers €'
              maxValue={yMaxValue}
              nbSteps={this.props.ySteps}
              width={this.props.yAxisWidth}
            />
          </g>
        </svg>
      </div>
    );
  },
});

module.exports = BaremeVisualization;
