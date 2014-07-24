/** @jsx React.DOM */
'use strict';

var
//  curry = require('lodash.curry'),
  Lazy = require('lazy.js'),
  React = require('react');

var axes = require('../../axes'),
  Curve = require('./svg/curve'),
  HGrid = require('./svg/h-grid'),
  VariablesTree = require('./variables-tree'),
  XAxisLabelled = require('./svg/x-axis-labelled'),
  YAxis = require('./svg/y-axis');


//var isDifferentThan = function(x, y) { return x, y; };
//var isDifferentThanC = curry(isDifferentThan);


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
      y: (1 - point.y / this.props.yMaxValue) * this.gridHeight,
    };
  },
  handleVariableHover: function(variable) {
    this.setState({hoveredBarCode: variable && variable.code});
  },
  render: function() {
    var variables = this.getVariables();
    var xSteps = variables.length;
    var valueMax = 0;
    var valueMin = 0;
    variables.forEach(function(variable) {
      var valuesMaxValue = Lazy(variable.values).max();
      if (valuesMaxValue > valueMax) {
        valueMax = valuesMaxValue;
      }
      var valuesMinValue = Lazy(variable.values).min();
      if (valuesMinValue < valueMin) {
        valueMin = valuesMinValue;
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
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', 0)'}>
            {
              variables.map(function(variable, idx) {
                var isSubtotal = variable.hasChildren && variable.depth > 0;
                return (
                  <Curve
                    points={variable.values}
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
