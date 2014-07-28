/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

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
    height: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    onVariableToggle: React.PropTypes.func,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
    // variablesTree.values key is a list. This tells which index to use.
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xMinValue: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    ySteps: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      marginRight: 10,
      marginTop: 10,
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
    var processNode = function(variable, depth, hidden) {
      var newVariables = [];
      var collapsed = variable.code in this.props.expandedVariables && this.props.expandedVariables[variable.code];
      if (variable.children) {
        var childrenVariables = [];
        Lazy(variable.children).each(function(child) {
          // TODO use map
          var childVariables = processNode(child, depth + 1, hidden || collapsed);
          childrenVariables = childrenVariables.concat(childVariables);
        }.bind(this));
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
    return {
      x: (point.x / this.props.xMaxValue) * this.gridWidth,
      y: (1 - point.y / this.yMaxValue) * this.gridHeight,
    };
  },
  handleVariableHover: function(variable) {
    this.setState({hoveredBarCode: variable && variable.code});
  },
  render: function() {
    this.yMaxValue = 100000;
    this.gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop;
    this.gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var variables = this.getVariables();
    var maxValue = 0;
    var minValue = 0;
    variables.forEach(function(variable) {
      var valuesMaxValue = Lazy(variable.values).max();
      if (valuesMaxValue > maxValue) {
        maxValue = valuesMaxValue;
      }
      var valuesMinValue = Lazy(variable.values).min();
      if (valuesMinValue < minValue) {
        minValue = valuesMinValue;
      }
    });
    var valuesRange = maxValue - minValue;
    var tickValue = axes.calculateStepSize(valuesRange, this.props.ySteps);
    var smartMaxValue = Math.round(maxValue / tickValue + 0.5) * tickValue;
    var smartMinValue = Math.round(minValue / tickValue - 0.5) * tickValue;
    var gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop,
      gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
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
            <XAxis
              height={this.props.xAxisHeight}
              label='% de la population'
              maxValue={this.props.xMaxValue}
              width={this.gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
            <VGrid
              height={this.gridHeight}
              nbSteps={variables.length}
              startStep={1}
              width={this.gridWidth}
            />
            <YAxis
              height={gridHeight}
              label='revenu en milliers €'
              maxValue={smartMaxValue}
              minValue={smartMinValue}
              nbSteps={this.props.ySteps}
              width={this.props.yAxisWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', 0)'}>
            {
              variables.map(function(variable) {
//                var isSubtotal = variable.hasChildren && variable.depth > 0;
                var values = Lazy.range(2000, 40000, (40000 - 2000) / 20)
                  .zip(variable.values)
                  .map(function(pair) { return {x: pair[0], y: pair[1]}; })
                  .toArray();
                return variable.code === 'revdisp' && (
                  <Curve
                    key={variable.code}
                    points={values}
                    pointToPixel={this.gridPointToPixel}
                    style={{stroke: 'rgb(31, 119, 180)'}}
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

module.exports = BaremeVisualization;
