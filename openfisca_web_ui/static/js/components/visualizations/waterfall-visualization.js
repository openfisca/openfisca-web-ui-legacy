/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var HGrid = require('./svg/h-grid'),
  WaterfallBars = require('./svg/waterfall-bars'),
  XAxisLabelled = require('./svg/x-axis-labelled'),
  YAxis = require('./svg/y-axis');


function calculateStepSize(range, stepsCount) {
  // cf http://stackoverflow.com/questions/361681/algorithm-for-nice-grid-line-intervals-on-a-graph
  // Calculate an initial guess at step size.
  var ln10 = Math.log(10);
  var tempStepSize = range / stepsCount;
  // Get the magnitude of the step size.
  var mag = Math.floor(Math.log(tempStepSize) / ln10);
  var magPow = Math.pow(10, mag);
  // Calculate most significant digit of the new step size.
  var magMsd = Math.round(tempStepSize / magPow + 0.5);
  // Promote the MSD to either 2, 5 or 10.
  if (magMsd > 5.0) {
    magMsd = 10.0;
  } else if (magMsd > 2.0) {
    magMsd = 5.0;
  } else if (magMsd > 1.0) {
    magMsd = 2.0;
  }
  return magMsd * magPow;
}

var WaterfallVisualization = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    legendHeight: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    onBarClick: React.PropTypes.func.isRequired,
    // The flags indicating whether a variable (with children) is closed or open (default).
    // This is stored in a separate dictionnary, to ensure that the flag will not be lost each time the variables
    // are updated by OpenFisca API.
    openedVariables: React.PropTypes.object.isRequired,
    // OpenFisca API simulation results.
    variablesTree: React.PropTypes.object.isRequired,
    // Values key is a list. This tells which index to use.
    variablesTreeValueIndex: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    ySteps: React.PropTypes.number.isRequired,
  },
  componentWillMount: function() {
    this.gridHeight = this.props.height - this.props.xAxisHeight - this.props.legendHeight;
    this.gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
  },
  extractVariablesFromTree: function(variablesByCode, node, baseValue, depth, hidden) {
    var children = node.children;
    var opened = this.props.openedVariables[node.code] || depth === 0;
    if (children) {
      var childBaseValue = baseValue;
      for (var childIndex = 0; childIndex < children.length; childIndex++) {
        var child = children[childIndex];
        this.extractVariablesFromTree(variablesByCode, child, childBaseValue, depth + 1, hidden || ! opened);
        childBaseValue += child.values[this.props.variablesTreeValueIndex];
      }
    }
    var value = node.values[this.props.variablesTreeValueIndex];
    node.baseValue = baseValue;
    node.depth = depth;
    node.value = value;
    if (! hidden && value !== 0) {
      node.type = opened && children ? 'bar' : 'var';
      variablesByCode[node.code] = node;
    }
  },
  getDefaultProps: function() {
    return {
      legendHeight: 30,
      marginRight: 10,
      variablesTreeValueIndex: 0,
      xAxisHeight: 150,
      yAxisWidth: 80,
      ySteps: 8,
    };
  },
  render: function() {
    var variablesByCode = {};
    this.extractVariablesFromTree(variablesByCode, this.props.variablesTree, 0, 0, false);
    var xSteps = Lazy(variablesByCode).keys().size();
    var valueMax = 0;
    var valueMin = 0;
    Lazy(variablesByCode).each(function(variable) {
      var value = variable.baseValue + variable.value;
      if (value > valueMax) {
        valueMax = value;
      } else if (value < valueMin) {
        valueMin = value;
      }
    });
    var valuesRange = valueMax - valueMin;
    var tickValue = calculateStepSize(valuesRange, this.props.ySteps);
    var smartValueMax = Math.round(valueMax / tickValue + 0.5) * tickValue;
    var smartValueMin = Math.round(valueMin / tickValue - 0.5) * tickValue;
    return (
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
          <XAxisLabelled
            height={this.props.xAxisHeight}
            labels={Lazy(variablesByCode).pluck('name').toArray()}
            nbSteps={xSteps}
            width={this.gridWidth}
          />
        </g>
        <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.legendHeight + ')'}>
          <YAxis
            height={this.gridHeight}
            label='revenu en milliers €'
            maxValue={smartValueMax}
            nbSteps={this.props.ySteps}
            width={this.props.yAxisWidth}
          />
          <WaterfallBars
            height={this.gridHeight}
            onBarClick={this.props.onBarClick}
            valueMax={smartValueMax}
            valueMin={smartValueMin}
            variablesByCode={variablesByCode}
            width={this.gridWidth}
          />
        </g>
      </svg>
    );
  },
});

module.exports = WaterfallVisualization;
