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
    expandedVariables: React.PropTypes.object.isRequired,
    height: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    onVariableToggle: React.PropTypes.func,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
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
  getVariables: function() {
    var processNode = function(variable, baseValue, depth, hidden) {
      var newVariables = [];
      var collapsed = variable.code in this.props.expandedVariables && this.props.expandedVariables[variable.code];
      if (variable.children) {
        var childrenVariables = [];
        var childBaseValue = baseValue;
        Lazy(variable.children).each(function(child) {
          var childVariables = processNode(child, childBaseValue, depth + 1, hidden || collapsed);
          childrenVariables = childrenVariables.concat(childVariables);
          childBaseValue += child.values[this.props.variablesTreeValueIndex];
        }.bind(this));
        newVariables = newVariables.concat(childrenVariables);
      }
      var value = variable.values[this.props.variablesTreeValueIndex];
      if (! hidden && value !== 0) {
        var newVariableSequence = Lazy(variable).omit(['children', 'values']);
        newVariableSequence = newVariableSequence.assign({
          baseValue: baseValue,
          collapsed: collapsed,
          depth: depth,
          hasChildren: !! variable.children,
          value: value,
        });
        var newVariable = newVariableSequence.toObject();
        newVariables.push(newVariable);
      }
      return newVariables;
    }.bind(this);
    var variables = processNode(this.props.variablesTree, 0, 0, false);
    return variables;
  },
  handleVariableHover: function(variable) {
    this.setState({hoveredBarCode: variable && variable.code});
  },
  render: function() {
    var variables = this.getVariables();
    var xSteps = variables.length;
    var maxValue = 0;
    var minValue = 0;
    variables.forEach(function(variable) {
      var value = variable.baseValue + variable.value;
      if (value > maxValue) {
        maxValue = value;
      } else if (value < minValue) {
        minValue = value;
      }
    });
    var valuesRange = maxValue - minValue;
    var tickValue = axes.calculateStepSize(valuesRange, this.props.ySteps);
    var smartMaxValue = Math.round(maxValue / tickValue + 0.5) * tickValue;
    var smartMinValue = Math.round(minValue / tickValue - 0.5) * tickValue;
    var xLabels = variables.map(function(variable) {
      var style = {};
      if (variable.code === this.state.hoveredBarCode) {
        style.fontWeight = 'bold';
      }
      var name = variable.short_name; // jshint ignore:line
      var isSubtotal = variable.hasChildren && variable.depth > 0;
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
              maxValue={smartMaxValue}
              nbSteps={this.props.ySteps}
              width={this.props.yAxisWidth}
            />
            <WaterfallBars
              height={gridHeight}
              highlightedVariableCode={this.state.hoveredBarCode}
              maxValue={smartMaxValue}
              minValue={smartMinValue}
              variables={variables}
              width={gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', 0)'}>
            {
              variables.map(function(variable, idx) {
                var isSubtotal = variable.hasChildren && variable.depth > 0;
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
