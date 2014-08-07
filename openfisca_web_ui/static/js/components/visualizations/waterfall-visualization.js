/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react'),
  strformat = require('strformat');

var axes = require('../../axes'),
  HGrid = require('./svg/h-grid'),
  VariablesTree = require('./variables-tree'),
  WaterfallBars = require('./svg/waterfall-bars'),
  WaterfallBarHover = require('./svg/waterfall-bar-hover'),
  XAxisLabelled = require('./svg/x-axis-labelled'),
  YAxis = require('./svg/y-axis');


var WaterfallVisualization = React.createClass({
  propTypes: {
    expandedVariables: React.PropTypes.object.isRequired,
    formatNumber: React.PropTypes.func.isRequired,
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
    yNbSteps: React.PropTypes.number.isRequired,
  },
  computeValuesBounds: function(variables) {
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
    return {maxValue: maxValue, minValue: minValue};
  },
  getDefaultProps: function() {
    return {
      marginRight: 10,
      marginTop: 10,
      variablesTreeValueIndex: 0,
      xAxisHeight: 100,
      yAxisWidth: 80,
      yNbSteps: 8,
    };
  },
  getInitialState: function() {
    return {
      activeVariableCode: null,
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
    this.setState({activeVariableCode: variable && variable.code});
  },
  render: function() {
    var variables = this.getVariables();
    var yBounds = this.computeValuesBounds(variables);
    var ySmartValues = axes.smartValues(yBounds.minValue, yBounds.maxValue, this.props.yNbSteps);
    var xLabels = variables.map(function(variable) {
      var style = {};
      if (variable.code === this.state.activeVariableCode) {
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
    var xSteps = variables.length;
    var stepWidth = gridWidth / xSteps;
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
              nbSteps={this.props.yNbSteps}
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
              formatNumber={this.props.formatNumber}
              height={gridHeight}
              label='revenu en €'
              maxValue={ySmartValues.maxValue}
              nbSteps={this.props.yNbSteps}
              width={this.props.yAxisWidth}
            />
            <WaterfallBars
              activeVariableCode={this.state.activeVariableCode}
              height={gridHeight}
              maxValue={ySmartValues.maxValue}
              minValue={ySmartValues.minValue}
              variables={variables}
              width={gridWidth}
            />
            {
              variables.map(function(variable, idx) {
                var isSubtotal = variable.hasChildren && variable.depth > 0;
                return (
                  <g key={variable.code} transform={strformat('translate({0}, 0)', stepWidth * idx)}>
                    <WaterfallBarHover
                      barHeight={gridHeight}
                      barWidth={stepWidth}
                      labelHeight={this.props.xAxisHeight}
                      onClick={
                        this.props.onVariableToggle && isSubtotal ?
                          this.props.onVariableToggle.bind(null, variable) : null
                      }
                      onHover={this.handleVariableHover}
                      variable={variable}
                    />
                  </g>
                );
              }, this)
            }
          </g>
        </svg>
        <VariablesTree
          activeVariableCode={this.state.activeVariableCode}
          formatNumber={this.props.formatNumber}
          onToggle={this.props.onVariableToggle}
          onHover={this.handleVariableHover}
          variables={variablesTreeVariables}
        />
      </div>
    );
  },
});

module.exports = WaterfallVisualization;
