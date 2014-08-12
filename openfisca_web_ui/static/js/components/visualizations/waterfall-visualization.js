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
    defaultActiveVariableCode: React.PropTypes.string.isRequired,
    displayExpandedSubtotals: React.PropTypes.bool.isRequired,
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
  formatHint: function(variables) {
    var variable = Lazy(variables).find({code: this.state.activeVariableCode});
    var [startValue, endValue] = [variable.baseValue + variable.value, variable.baseValue].sort();
    if (variable.value < 0) {
      [endValue, startValue] = [startValue, endValue];
    }
    var hintFormat = startValue && endValue ? '{variableName} : {startValue} {operator} {absoluteValue} = {endValue} €' : // jshint ignore:line
      '{variableName} : {absoluteValue} €'; // jshint ignore:line
    return strformat(hintFormat, {
      absoluteValue: this.props.formatNumber(Math.abs(variable.value)),
      endValue: this.props.formatNumber(endValue, {fixed: 2}),
      operator: variable.value > 0 ? '+' : '−',
      startValue: this.props.formatNumber(startValue),
      variableName: variable.name,
    });
  },
  getDefaultProps: function() {
    return {
      defaultActiveVariableCode: 'revdisp',
      labelsFontSize: 14,
      marginRight: 10,
      marginTop: 10,
      variablesTreeValueIndex: 0,
      xAxisHeight: 100,
      yAxisWidth: 80,
      yNbSteps: 8,
    };
  },
  getInitialState: function() {
    return {activeVariableCode: this.props.defaultActiveVariableCode};
  },
  getVariables: function() {
    var processNode = (variable, baseValue, depth, hidden) => {
      var newVariables = [];
      var isCollapsed = variable.code in this.props.expandedVariables && this.props.expandedVariables[variable.code];
      if (variable.children) {
        var childrenVariables = [];
        var childBaseValue = baseValue;
        Lazy(variable.children).each(child => {
          var childVariables = processNode(child, childBaseValue, depth + 1, hidden || isCollapsed);
          childrenVariables = childrenVariables.concat(childVariables);
          childBaseValue += child.values[this.props.variablesTreeValueIndex];
        });
        newVariables = newVariables.concat(childrenVariables);
      }
      var value = variable.values[this.props.variablesTreeValueIndex];
      if (! hidden && value !== 0) {
        var newVariableSequence = Lazy(variable).omit(['children', 'values']);
        var hasChildren = !! variable.children;
        newVariableSequence = newVariableSequence.assign({
          baseValue: baseValue,
          depth: depth,
          hasChildren: hasChildren,
          isCollapsed: isCollapsed,
          isSubtotal: hasChildren && depth > 0,
          value: value,
        });
        var newVariable = newVariableSequence.toObject();
        newVariables.push(newVariable);
      }
      return newVariables;
    };
    var variables = processNode(this.props.variablesTree, 0, 0, false);
    return variables;
  },
  handleVariableHover: function(variable) {
    this.setState({activeVariableCode: variable ? variable.code : this.props.defaultActiveVariableCode});
  },
  render: function() {
    var variables = this.getVariables();
    var displayedVariables = this.props.displayExpandedSubtotals ? variables :
      Lazy(variables).filter(variable => ! variable.isSubtotal || variable.isCollapsed).toArray();
    var yBounds = this.computeValuesBounds(variables);
    var ySmartValues = axes.smartValues(yBounds.minValue, yBounds.maxValue, this.props.yNbSteps);
    var xLabels = displayedVariables.map(variable => {
      var style = {cursor: 'default'};
      if (variable.code === this.state.activeVariableCode) {
        style.textDecoration = 'underline';
      }
      var name = variable.short_name; // jshint ignore:line
      if (variable.isSubtotal) {
        name = (variable.isCollapsed ? '▶' : '▼') + ' ' + name;
      }
      var props = {
        onMouseOut: this.handleVariableHover.bind(null, null),
        onMouseOver: this.handleVariableHover.bind(null, variable),
      };
      if (this.props.onVariableToggle && variable.isSubtotal) {
        style.cursor = 'pointer';
        props.onClick = this.props.onVariableToggle.bind(null, variable);
      }
      return {name: name, props: props, style: style};
    });
    var gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop,
      gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var xSteps = xLabels.length;
    var stepWidth = gridWidth / xSteps;
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
              labelsFontSize={this.props.labelsFontSize}
              nbSteps={xSteps}
              width={gridWidth}
            />
          </g>
          <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
            <YAxis
              formatNumber={this.props.formatNumber}
              height={gridHeight}
              maxValue={ySmartValues.maxValue}
              nbSteps={this.props.yNbSteps}
              unit='€'
              width={this.props.yAxisWidth}
            />
            <WaterfallBars
              activeVariableCode={this.state.activeVariableCode}
              displayExpandedSubtotals={this.props.displayExpandedSubtotals}
              height={gridHeight}
              maxValue={ySmartValues.maxValue}
              minValue={ySmartValues.minValue}
              variables={displayedVariables}
              width={gridWidth}
            />
            {
              displayedVariables.map((variable, idx) =>
                <g key={variable.code} transform={strformat('translate({0}, 0)', stepWidth * idx)}>
                  <WaterfallBarHover
                    barHeight={gridHeight}
                    barWidth={stepWidth}
                    enableLabelsHover={false}
                    labelHeight={this.props.labelsFontSize * 1.5}
                    labelWidth={this.props.xAxisHeight}
                    onClick={
                      this.props.onVariableToggle && variable.isSubtotal ?
                        this.props.onVariableToggle.bind(null, variable) : null
                    }
                    onHover={this.handleVariableHover}
                    variable={variable}
                  />
                </g>
              )
            }
          </g>
        </svg>
        <p className='well' style={{textAlign: 'center'}}>
          {this.formatHint(variables)}
        </p>
        <VariablesTree
          activeVariableCode={this.state.activeVariableCode}
          formatNumber={this.props.formatNumber}
          onToggle={this.props.onVariableToggle}
          onHover={this.handleVariableHover}
          variables={variables}
        />
      </div>
    );
  },
});

module.exports = WaterfallVisualization;
