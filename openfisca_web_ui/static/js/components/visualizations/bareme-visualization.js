/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react'),
  strformat = require('strformat');

var axes = require('../../axes'),
  Curve = require('./svg/curve'),
  HGrid = require('./svg/h-grid'),
  VariablesTree = require('./variables-tree'),
  VGrid = require('./svg/v-grid'),
  XAxis = require('./svg/x-axis'),
  YAxis = require('./svg/y-axis');


var BaremeVisualization = React.createClass({
  propTypes: {
    expandedVariables: React.PropTypes.object.isRequired,
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    onVariableToggle: React.PropTypes.func,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
    // variablesTree.values key is a list. This tells which index to use.
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    xLabel: React.PropTypes.string.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xMinValue: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    xNbSteps: React.PropTypes.number.isRequired,
    yNbSteps: React.PropTypes.number.isRequired,
  },
  computeValuesBounds: function(variables) {
    var maxValue = 0;
    var minValue = 0;
    variables.forEach(function(variable) {
      var variableMaxValue = Math.max.apply(null, variable.values);
      if (variableMaxValue > maxValue) {
        maxValue = variableMaxValue;
      }
      var variableMinValue = Math.min.apply(null, variable.values);
      if (variableMinValue < minValue) {
        minValue = variableMinValue;
      }
    });
    return {maxValue: maxValue, minValue: minValue};
  },
  getDefaultProps: function() {
    return {
      marginRight: 10,
      marginTop: 10,
      xAxisHeight: 60,
      yAxisWidth: 80,
      xNbSteps: 10,
      yNbSteps: 8,
    };
  },
  getInitialState: function() {
    return {
      hoveredBarCode: null,
    };
  },
  getVariables: function() {
    var processNode = function(variable, depth, hidden) {
      var newVariables = [];
      var collapsed = variable.code in this.props.expandedVariables && this.props.expandedVariables[variable.code];
      if (variable.children) {
        var childrenVariables = Lazy(variable.children)
          .map(function(child) { return processNode(child, depth + 1, hidden || collapsed); })
          .flatten()
          .toArray();
        newVariables = newVariables.concat(childrenVariables);
      }
      var hasValue = Lazy(variable.values).any(function(value) { return value !== 0; });
      if (! hidden && hasValue) {
        var newVariableSequence = Lazy(variable).omit(['children']);
        newVariableSequence = newVariableSequence.assign({
          collapsed: collapsed,
          depth: depth,
          hasChildren: !! variable.children,
        });
        var newVariable = newVariableSequence.toObject();
        newVariables.push(newVariable);
      }
      return newVariables;
    }.bind(this);
    var variables = processNode(this.props.variablesTree, 0, false);
    return variables;
  },
  gridPointToPixel: function(point) {
    var pixel = {
      x: axes.convertLinearRange({
        newMax: this.gridWidth,
        newMin: 0,
        oldMax: this.props.xMaxValue,
        oldMin: this.props.xMinValue,
      }, point.x),
      y: axes.convertLinearRange({
        newMax: 0,
        newMin: this.gridHeight,
        oldMax: this.ySmartValues.maxValue,
        oldMin: this.ySmartValues.minValue,
      }, point.y),
    };
    return pixel;
  },
  handleVariableHover: function(variable) {
    this.setState({hoveredBarCode: variable && variable.code});
  },
  render: function() {
    this.gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop;
    this.gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var variables = this.getVariables();
    var yBounds = this.computeValuesBounds(variables);
    this.ySmartValues = axes.smartValues(yBounds.minValue, yBounds.maxValue, this.props.yNbSteps);
    var variablesSequence = Lazy(variables);
    var variablesTreeVariables = variablesSequence.initial().reverse().concat(variablesSequence.last()).toArray();
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
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
            <VGrid
              height={this.gridHeight}
              nbSteps={this.props.xNbSteps}
              startStep={1}
              width={this.gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
            {
              variables.map(function(variable) {
                var toDomainValue = axes.convertLinearRange.bind(
                  null,
                  {
                    newMax: this.props.xMaxValue,
                    newMin: this.props.xMinValue,
                    oldMax: variable.values.length - 1,
                    oldMin: 0,
                  }
                );
                var points = Lazy.range(0, variable.values.length)
                  .map(toDomainValue)
                  .zip(variable.values)
                  .map(function(pair) { return {x: pair[0], y: pair[1]}; })
                  .toArray();
                var isFilled = ! variable.collapsed && variable.depth > 0;
                return (
                  <Curve
                    fill={isFilled}
                    key={variable.code}
                    points={points}
                    pointToPixel={this.gridPointToPixel}
                    style={{
                      fill: isFilled ? strformat('rgb({0}, {1}, {2})', variable.color) : 'none',
                      stroke: isFilled ? null : strformat('rgb({0}, {1}, {2})', variable.color),
                    }}
                    xMaxValue={this.props.xMaxValue}
                    xMinValue={this.props.xMinValue}
                    yMinValue={this.ySmartValues.minValue}
                  />
                );
              }, this)
            }
            <YAxis
              formatNumber={this.props.formatNumber}
              height={this.gridHeight}
              label='en €'
              maxValue={this.ySmartValues.maxValue}
              minValue={this.ySmartValues.minValue}
              nbSteps={this.props.yNbSteps}
              width={this.props.yAxisWidth}
            />
          </g>
          <g transform={
            'translate(' + this.props.yAxisWidth + ', ' + (this.props.height - this.props.xAxisHeight) + ')'
          }>
            <XAxis
              formatNumber={this.props.formatNumber}
              height={this.props.xAxisHeight}
              label={this.props.xLabel}
              maxValue={this.props.xMaxValue}
              minValue={this.props.xMinValue}
              nbSteps={this.props.xNbSteps}
              width={this.gridWidth}
            />
          </g>
        </svg>
        <div style={{marginTop: 30}}>
          <VariablesTree
            highlightedVariableCode={this.state.hoveredBarCode}
            onToggle={this.props.onVariableToggle}
            onHover={this.handleVariableHover}
            variables={variablesTreeVariables}
          />
        </div>
      </div>
    );
  },
});

module.exports = BaremeVisualization;
