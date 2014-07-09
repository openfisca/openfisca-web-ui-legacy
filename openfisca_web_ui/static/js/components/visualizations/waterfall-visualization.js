/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var axes = require('../../axes'),
  HGrid = require('./svg/h-grid'),
  HoverBar = require('./svg/hover-bar'),
  VariablesTree = require('./variables-tree'),
  WaterfallBars = require('./svg/waterfall-bars'),
  XAxisLabelled = require('./svg/x-axis-labelled'),
  YAxis = require('./svg/y-axis');


var WaterfallVisualization = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    legendHeight: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    // OpenFisca API simulation results.
    variablesTree: React.PropTypes.object.isRequired,
    // Values key is a list. This tells which index to use.
    variablesTreeValueIndex: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    ySteps: React.PropTypes.number.isRequired,
  },
  extractVariablesFromTree: function(variablesByCode, node, baseValue, depth, hidden) {
    var children = node.children;
//    var opened = this.props.openedVariables[node.code] || depth === 0;
    var opened = true;
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
      xAxisHeight: 100,
      yAxisWidth: 80,
      ySteps: 8,
    };
  },
  getInitialState: function() {
    return {
      hoveredBarCode: null,
    };
  },
  handleVariableHover: function(variable) {
    this.setState({hoveredBarCode: variable && variable.code});
  },
  render: function() {
    var variablesByCode = {};
    this.extractVariablesFromTree(variablesByCode, this.props.variablesTree, 0, 0, false);
    var variables = Lazy(variablesByCode).values().toArray();
    var xSteps = variables.length;
    var valueMax = 0;
    var valueMin = 0;
    variables.forEach(function(variable) {
      var value = variable.baseValue + variable.value;
      if (value > valueMax) {
        valueMax = value;
      } else if (value < valueMin) {
        valueMin = value;
      }
    });
    var valuesRange = valueMax - valueMin;
    var tickValue = axes.calculateStepSize(valuesRange, this.props.ySteps);
    var smartValueMax = Math.round(valueMax / tickValue + 0.5) * tickValue;
    var smartValueMin = Math.round(valueMin / tickValue - 0.5) * tickValue;
    var xLabels = variables.map(function(variable) {
      var style = {};
      if (variable.code === this.state.hoveredBarCode) {
        style.fontWeight = 'bold';
      }
      var name = variable.short_name; // jshint ignore:line
      if (variable.children) {
        name = '▾ ' + name;
      }
      return {name: name, style: style};
    }, this);
    var hoveredBar = variablesByCode[this.state.hoveredBarCode];
    var gridHeight = this.props.height - this.props.xAxisHeight - this.props.legendHeight,
      gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var tickWidth = gridWidth / xSteps;
    return (
      <div>
        <svg height={this.props.height} width={this.props.width}>
          <g transform={
            'translate(' + this.props.yAxisWidth + ', ' + (this.props.height - this.props.xAxisHeight) + ')'
          }>
            <HGrid
              height={gridHeight}
              nbSteps={this.props.ySteps}
              startStep={1}
              width={gridWidth}
            />
            <XAxisLabelled
              height={this.props.xAxisHeight}
              labels={xLabels}
              nbSteps={xSteps}
              width={gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.legendHeight + ')'}>
            <YAxis
              height={gridHeight}
              label='revenu en milliers €'
              maxValue={smartValueMax}
              nbSteps={this.props.ySteps}
              width={this.props.yAxisWidth}
            />
            <WaterfallBars
              activeVariableCode={this.state.hoveredBarCode}
              height={gridHeight}
              valueMax={smartValueMax}
              valueMin={smartValueMin}
              variables={variables}
              width={gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', 0)'}>
            {
              variables.map(function(variable, idx) {
                return (
                  <HoverBar
                    height={this.props.height}
                    key={variable.code}
                    onMouseOut={this.handleVariableHover.bind(null, null)}
                    onMouseOver={this.handleVariableHover.bind(null, variable)}
                    width={tickWidth}
                    x={tickWidth * idx}
                  />
                );
              }, this)
            }
          </g>
        </svg>
        <VariablesTree
          activeVariableCode={this.state.hoveredBarCode}
          onHover={this.handleVariableHover}
          variablesTree={this.props.variablesTree}
        />
      </div>
    );
  },
});

module.exports = WaterfallVisualization;
