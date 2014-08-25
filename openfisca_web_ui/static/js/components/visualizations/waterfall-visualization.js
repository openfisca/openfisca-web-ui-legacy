/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons');

var axes = require('../../axes'),
  HGrid = require('./svg/h-grid'),
  VariablesTree = require('./variables-tree'),
  WaterfallBars = require('./svg/waterfall-bars'),
  WaterfallBarHover = require('./svg/waterfall-bar-hover'),
  XAxisLabelled = require('./svg/x-axis-labelled'),
  YAxis = require('./svg/y-axis');


var WaterfallVisualization = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  propTypes: {
    defaultActiveVariableCode: React.PropTypes.string,
    defaultDisplaySubtotalThinBars: React.PropTypes.bool,
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
      defaultActiveVariableCode: null,
      defaultDisplaySubtotalThinBars: false,
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
    return {
      activeVariableCode: this.props.defaultActiveVariableCode,
      displaySubtotalThinBars: this.props.defaultDisplaySubtotalThinBars,
      xAxisHoveredVariableCode: this.props.defaultActiveVariableCode,
    };
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
  handleXAxisLabelledVariableHover: function(variable) {
    this.setState({xAxisHoveredVariableCode: variable ? variable.code : this.props.defaultActiveVariableCode});
    this.handleVariableHover(variable);
  },
  render: function() {
    var variables = this.getVariables();
    var waterfallBarsVariables = this.state.displaySubtotalThinBars ? variables :
      Lazy(variables).filter(variable => ! variable.isSubtotal || variable.isCollapsed).toArray();
    var yBounds = this.computeValuesBounds(variables);
    var ySmartValues = axes.smartValues(yBounds.minValue, yBounds.maxValue, this.props.yNbSteps);
    var xLabels = waterfallBarsVariables.map(variable => {
      var style = {cursor: null};
      var name = variable.short_name; // jshint ignore:line
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
        props.onClick = this.props.onVariableToggle.bind(null, variable);
      }
      return {name, props, style};
    });
    var gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop,
      gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var xSteps = xLabels.length;
    var stepWidth = gridWidth / xSteps;
    var xAxisTransform = `translate(${this.props.yAxisWidth}, ${this.props.height - this.props.xAxisHeight})`;
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
              activeVariableCode={this.state.activeVariableCode}
              height={gridHeight}
              maxValue={ySmartValues.maxValue}
              minValue={ySmartValues.minValue}
              variables={waterfallBarsVariables}
              width={gridWidth}
            />
            {
              waterfallBarsVariables.map((variable, idx) =>
                <g key={variable.code} transform={`translate(${stepWidth * idx}, 0)`}>
                  <WaterfallBarHover
                    activeVariableCode={this.state.activeVariableCode}
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
              nbSteps={xSteps}
              width={gridWidth}
            />
          </g>
        </svg>
        <p className='well' style={{textAlign: 'center'}}>
          {this.state.activeVariableCode ? this.formatHint(variables) : 'Survolez le graphique'}
        </p>
        <VariablesTree
          activeVariableCode={this.state.activeVariableCode}
          formatNumber={this.props.formatNumber}
          onToggle={this.props.onVariableToggle}
          onHover={this.handleVariableHover}
          variables={variables}
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
          </div>
        </div>
      </div>
    );
  },
});

module.exports = WaterfallVisualization;
