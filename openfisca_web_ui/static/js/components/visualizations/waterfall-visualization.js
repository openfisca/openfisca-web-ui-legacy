/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var axes = require('../../axes'),
  HGrid = require('./svg/h-grid'),
  VariablesTree = require('./variables-tree'),
  WaterfallBars = require('./svg/waterfall-bars'),
  XAxisLabelled = require('./svg/x-axis-labelled'),
  YAxis = require('./svg/y-axis');


var WaterfallVisualization = React.createClass({
  propTypes: {
    expandedVariables: React.PropTypes.object,
    height: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    onVariableToggle: React.PropTypes.func,
    // OpenFisca API simulation results.
    variablesTree: React.PropTypes.object.isRequired,
    // variablesTree.values key is a list. This tells which index to use.
    variablesTreeValueIndex: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    ySteps: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      marginRight: 10,
      marginTop: 10,
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
  rebuildVariablesTree: function(variablesByCode, node, baseValue, depth, hidden) {
    var children = node.children;
    node.collapsed = node.code in this.props.expandedVariables && this.props.expandedVariables[node.code];
    if (children) {
      var childBaseValue = baseValue;
      for (var childIndex = 0; childIndex < children.length; childIndex++) {
        var child = children[childIndex];
        this.rebuildVariablesTree(variablesByCode, child, childBaseValue, depth + 1, hidden || node.collapsed);
        childBaseValue += child.values[this.props.variablesTreeValueIndex];
      }
    }
    var value = node.values[this.props.variablesTreeValueIndex];
    node.baseValue = baseValue;
    node.depth = depth;
    node.value = value;
    if (! hidden && value !== 0) {
      variablesByCode[node.code] = node;
      node.type = ! node.collapsed && children ? 'bar' : 'var';
    }
  },
  render: function() {
    var variablesByCode = {};
    this.rebuildVariablesTree(variablesByCode, this.props.variablesTree, 0, 0, false);
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
      var isSubtotal = variable.children && variable.depth > 0;
      if (isSubtotal) {
        name = (variable.collapsed ? '▶' : '▼') + ' ' + name;
      }
      return {name: name, style: style};
    }, this);
    var gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop,
      gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var tickWidth = gridWidth / xSteps;
    var variablesSequence = Lazy(variables);
    var variablesTreeVariables = variablesSequence.initial().reverse().concat(variablesSequence.last()).toArray();
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
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
            <YAxis
              height={gridHeight}
              label='revenu en milliers €'
              maxValue={smartValueMax}
              nbSteps={this.props.ySteps}
              width={this.props.yAxisWidth}
            />
            <WaterfallBars
              height={gridHeight}
              highlightedVariableCode={this.state.hoveredBarCode}
              valueMax={smartValueMax}
              valueMin={smartValueMin}
              variables={variables}
              width={gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', 0)'}>
            {
              variables.map(function(variable, idx) {
                var isSubtotal = variable.children && variable.depth > 0;
                return (
                  <rect
                    height={this.props.height}
                    key={variable.code}
                    onClick={
                      this.props.onVariableToggle && isSubtotal && this.props.onVariableToggle.bind(null, variable)
                    }
                    onMouseOut={this.handleVariableHover.bind(null, null)}
                    onMouseOver={this.handleVariableHover.bind(null, variable)}
                    style={{opacity: 0}}
                    width={tickWidth}
                    x={tickWidth * idx}
                    y={0}
                  />
                );
              }, this)
            }
          </g>
        </svg>
        <VariablesTree
          highlightedVariableCode={this.state.hoveredBarCode}
          onToggle={this.props.onVariableToggle}
          onHover={this.handleVariableHover}
          variables={variablesTreeVariables}
        />
      </div>
    );
  },
});

module.exports = WaterfallVisualization;
