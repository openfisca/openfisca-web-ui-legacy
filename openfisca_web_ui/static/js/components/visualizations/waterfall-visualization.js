/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  TweenState = require('react-tween-state');

var axes = require('../../axes'),
  HGrid = require('./svg/h-grid'),
  VariablesTree = require('./variables-tree'),
  WaterfallBars = require('./svg/waterfall-bars'),
  WaterfallBarHover = require('./svg/waterfall-bar-hover'),
  XAxisLabelled = require('./svg/x-axis-labelled'),
  YAxis = require('./svg/y-axis');


var WaterfallVisualization = React.createClass({
  mixins: [React.addons.LinkedStateMixin, TweenState.Mixin],
  propTypes: {
    collapsedVariables: React.PropTypes.object.isRequired,
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    negativeColor: React.PropTypes.string.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onVariableToggle: React.PropTypes.func,
    positiveColor: React.PropTypes.string.isRequired,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
    // variablesTree.values key is a list. This tells which index to use.
    variablesTreeValueIndex: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    yNbSteps: React.PropTypes.number.isRequired,
  },
  determineYAxisRange: function(variables) {
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
    return [minValue, maxValue];
  },
  formatHint: function(variables) {
    var variable = Lazy(variables).find({code: this.state.activeVariableCode});
    var [startValue, endValue] = [variable.baseValue + variable.value, variable.baseValue].sort();
    if (variable.value < 0) {
      [endValue, startValue] = [startValue, endValue];
    }
    var absoluteValue = this.props.formatNumber(Math.abs(variable.value)),
      formattedEndValue = this.props.formatNumber(endValue, {fixed: 2}),
      formattedStartValue = this.props.formatNumber(startValue),
      operator = variable.value > 0 ? '+' : '−',
      variableName = variable.name;
    var hint = startValue && endValue ?
      `${variableName} : ${formattedStartValue} ${operator} ${absoluteValue} = ${formattedEndValue} €` : // jshint ignore:line
      `${variableName} : ${absoluteValue} €`; // jshint ignore:line
    return hint;
  },
  getDefaultProps: function() {
    return {
      labelsFontSize: 14,
      marginRight: 10,
      marginTop: 10,
      negativeColor: '#d9534f', // Bootstrap danger color
      noColorFill: 'gray',
      positiveColor: '#5cb85c', // Bootstrap success color
      variablesTreeValueIndex: 0,
      xAxisHeight: 100,
      yAxisWidth: 80,
      yNbSteps: 8,
    };
  },
  getInitialState: function() {
    return {
      activeVariableCode: null,
      displaySubtotalThinBars: null,
      displayVariablesColors: null,
      tweenProgress: null,
      variablesTreeHoveredVariableCode: null,
      xAxisHoveredVariableCode: null,
    };
  },
  handleVariableHover: function(variable) {
    this.setState({activeVariableCode: variable ? variable.code : null});
  },
  handleVariablesTreeVariableHover: function(variable) {
    this.setState({variablesTreeHoveredVariableCode: variable ? variable.code : null});
    this.handleVariableHover(variable);
  },
  handleVariableToggle: function(variable) {
    if (variable.isCollapsed) {
      this.props.onVariableToggle(variable);
    } else {
      this.tweenState('tweenProgress', {
        beginValue: variable.isCollapsed ? 1 : 0,
        duration: 500,
        endValue: variable.isCollapsed ? 0 : 1,
        onEnd: () => {
          this.setState({tweenProgress: null});
          this.props.onVariableToggle(variable);
        },
      });
    }
    this.setState({xAxisHoveredVariableCode: null});
  },
  handleXAxisLabelledVariableHover: function(variable) {
    this.setState({xAxisHoveredVariableCode: variable ? variable.code : null});
    this.handleVariableHover(variable);
  },
  linearizeVariables: function() {
    // Transform this.props.variablesTree into a list and compute base values for waterfall.
    // Also rename snake case keys to camel case.
    var valueIndex = this.props.variablesTreeValueIndex;
    function extractChildrenCodes(node) {
      return node.children ? node.children.map(child => {
        var childrenCodes = extractChildrenCodes(child);
        return childrenCodes ? [child.code, ...childrenCodes] : child.code;
      }).flatten() : null;
    }
    var walk = (variable, baseValue = 0, depth = 0) => {
      var newVariables = [];
      if (variable.children) {
        var childrenVariables = [];
        var childBaseValue = baseValue;
        variable.children.forEach(child => {
          var childVariables = walk(child, childBaseValue, depth + 1);
          childrenVariables = childrenVariables.concat(childVariables);
          childBaseValue += child.values[valueIndex];
        });
        newVariables = newVariables.concat(childrenVariables);
      }
      var value = variable.values[valueIndex];
      var childrenCodes = extractChildrenCodes(variable);
      var newVariable = Lazy(variable)
        .omit(['@context', '@type', 'children', 'short_name', 'values'])
        .assign({
          baseValue: baseValue,
          childrenCodes: childrenCodes,
          depth: depth,
          isCollapsed: variable.code in this.props.collapsedVariables && this.props.collapsedVariables[variable.code],
          isSubtotal: Boolean(variable.children) && depth > 0,
          shortName: variable.short_name, // jshint ignore:line
          value: value,
        })
        .toObject();
      newVariables.push(newVariable);
      return newVariables;
    };
    var variables = walk(this.props.variablesTree);
    return variables;
  },
  removeVariables: function(variables, isRemoved, removeChildren = false) {
    // Filter variables by isRemoved function and rewrite their childrenCodes properties
    // according to the remaining variables.
    var variablesCodes = removeChildren ?
      variables.filter(isRemoved).map(variable => variable.childrenCodes).flatten().uniq() :
      variables.filter(isRemoved).map(variable => variable.code);
    return variables
      .filter(variable => ! variablesCodes.contains(variable.code))
      .map(variable => variable.childrenCodes ? Lazy(variable).assign({
        childrenCodes: variable.childrenCodes.diff(variablesCodes)
      }).toObject() : variable);
  },
  render: function() {
    var linearizedVariables = this.linearizeVariables();
    var isZeroValue = variable => variable.value === 0;
    var isSubtotal = variable => variable.isSubtotal && ! variable.isCollapsed;
    var isCollapsed = variable => variable.isCollapsed;
    var variablesWithSubtotals = this.removeVariables(linearizedVariables, isZeroValue);
    var variablesWithoutSubtotals = this.removeVariables(variablesWithSubtotals, isSubtotal);
    var displayedVariablesWithSubtotals = this.removeVariables(variablesWithSubtotals, isCollapsed, true);
    var displayedVariablesWithoutSubtotals = this.removeVariables(variablesWithoutSubtotals, isCollapsed, true);
    var waterfallBarsVariables = this.state.displaySubtotalThinBars ? displayedVariablesWithSubtotals :
      displayedVariablesWithoutSubtotals;
    var variablesTreeVariables = displayedVariablesWithSubtotals;
    var [yAxisMinValue, yAxisMaxValue] = this.determineYAxisRange(variablesWithoutSubtotals);
    var ySmartValues = axes.smartValues(yAxisMinValue, yAxisMaxValue, this.props.yNbSteps);
    var xLabels = waterfallBarsVariables.map(variable => {
      var style = {};
      var name = variable.shortName;
      if (variable.isSubtotal) {
        name = (variable.isCollapsed ? '▶' : '▼') + ' ' + name;
        if (variable.code === this.state.xAxisHoveredVariableCode) {
          style.textDecoration = 'underline';
        }
      }
      var props = {
        onMouseOut: this.handleXAxisLabelledVariableHover.bind(null, null),
        onMouseOver: this.handleXAxisLabelledVariableHover.bind(null, variable),
      };
      if (this.props.onVariableToggle && variable.isSubtotal) {
        style.cursor = 'pointer';
        props.onClick = this.handleVariableToggle.bind(null, variable);
      }
      return {name, props, style};
    });
    var gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop,
      gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var stepWidth = gridWidth / xLabels.length;
    var xAxisTransform = `translate(${this.props.yAxisWidth}, ${this.props.height - this.props.xAxisHeight})`;
    var activeVariablesCodes = null;
    if (this.state.activeVariableCode) {
      activeVariablesCodes = [this.state.activeVariableCode];
      if (this.state.activeVariableCode !== 'revdisp') {
        var activeVariable = displayedVariablesWithSubtotals.find(_ => _.code === this.state.activeVariableCode);
        activeVariablesCodes = activeVariablesCodes.concat(activeVariable.childrenCodes);
      }
      activeVariablesCodes = activeVariablesCodes.intersection(waterfallBarsVariables.map(_ => _.code));
    }
    return (
      <div>
        <svg height={this.props.height} width={this.props.width}>
          <g transform={xAxisTransform}>
            <HGrid
              height={gridHeight}
              nbSteps={this.props.yNbSteps}
              startStep={1}
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
              activeVariablesCodes={activeVariablesCodes}
              displayVariablesColors={this.state.displayVariablesColors}
              height={gridHeight}
              maxValue={ySmartValues.maxValue}
              minValue={ySmartValues.minValue}
              negativeColor={this.props.negativeColor}
              noColorFill={this.props.noColorFill}
              positiveColor={this.props.positiveColor}
              variables={waterfallBarsVariables}
              width={gridWidth}
            />
            {
              waterfallBarsVariables.map((variable, idx) =>
                <g key={variable.code} transform={`translate(${stepWidth * idx}, 0)`}>
                  <WaterfallBarHover
                    barHeight={gridHeight}
                    barWidth={stepWidth}
                    labelHeight={this.props.labelsFontSize * 1.5}
                    labelWidth={this.props.xAxisHeight}
                    onHover={this.handleVariableHover}
                    variable={variable}
                  />
                </g>
              )
            }
          </g>
          <g transform={xAxisTransform}>
            <XAxisLabelled
              height={this.props.xAxisHeight}
              labels={xLabels}
              labelsFontSize={this.props.labelsFontSize}
              nbSteps={xLabels.length}
              width={gridWidth}
            />
          </g>
        </svg>
        <p className='text-center well'>
          {this.state.activeVariableCode ? this.formatHint(variablesWithSubtotals) : 'Survolez le graphique'}
        </p>
        <VariablesTree
          activeVariableCode={this.state.activeVariableCode}
          displayVariablesColors={this.state.displayVariablesColors}
          formatNumber={this.props.formatNumber}
          hoveredVariableCode={this.state.variablesTreeHoveredVariableCode}
          negativeColor={this.props.negativeColor}
          noColorFill={this.props.noColorFill}
          positiveColor={this.props.positiveColor}
          onToggle={this.handleVariableToggle}
          onHover={this.handleVariablesTreeVariableHover}
          variables={variablesTreeVariables}
        />
        <div className='panel panel-default'>
          <div className='panel-heading'>
            Paramètres
          </div>
          <div className='panel-body'>
            <div className='checkbox'>
              <label>
                <input checkedLink={this.linkState('displaySubtotalThinBars')} type='checkbox' />
                Afficher les sous-totaux
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input checkedLink={this.linkState('displayVariablesColors')} type='checkbox' />
                Afficher les couleurs des variables
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

module.exports = WaterfallVisualization;
