/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react/addons'),
  recursiveFind = require('recursive-find'),
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
    defaultDisplaySubtotalThinBars: React.PropTypes.bool,
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
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
      defaultDisplaySubtotalThinBars: false,
      labelsFontSize: 14,
      marginRight: 10,
      marginTop: 10,
      noColorFill: 'gray',
      variablesTreeValueIndex: 0,
      xAxisHeight: 100,
      yAxisWidth: 80,
      yNbSteps: 8,
    };
  },
  getInitialState: function() {
    return {
      activeVariableCode: null,
      activeVariablesCodes: null,
      displaySubtotalThinBars: this.props.defaultDisplaySubtotalThinBars,
      tweenVariablesPercentage: null,
      variablesTreeHoveredVariableCode: null,
      xAxisHoveredVariableCode: null,
    };
  },
  getVariables: function() {
    var processNode = (variable, baseValue, depth, hidden) => {
      var newVariables = [];
      var isCollapsed = this.isCollapsed(variable);
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
        var newVariableSequence = Lazy(variable).omit(['values']);
        newVariableSequence = newVariableSequence.assign({
          baseValue: baseValue,
          depth: depth,
          isCollapsed: isCollapsed,
          isSubtotal: !! variable.children && depth > 0,
          nbChildren: Lazy(variable.children)
            .filter(child => child.values[this.props.variablesTreeValueIndex] && child.code)
            .size(),
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
    function walk(node) {
      return node.children ? node.children.map(child => {
        var walkResult = walk(child);
        return walkResult ? [child.code, ...walkResult] : child.code;
      }).flatten() : null;
    }
    var changeset = {
      activeVariableCode: variable ? variable.code : null,
      activeVariableChildrenCodes: null,
    };
    if (variable && variable.code !== 'revdisp') {
      var variablesInTree = recursiveFind(this.props.variablesTree,
        treeVariable => treeVariable.code === variable.code);
      invariant(variablesInTree.length === 1, 'recursiveFind should return only one node');
      var childrenCodes = walk(variablesInTree[0]);
      if (childrenCodes && childrenCodes.length) {
        changeset.activeVariableChildrenCodes = childrenCodes;
      }
    }
    this.setState(changeset);
  },
  handleVariablesTreeVariableHover: function(variable) {
    this.setState({variablesTreeHoveredVariableCode: variable ? variable.code : null});
    this.handleVariableHover(variable);
  },
  handleVariableToggle: function(variable) {
    this.setState({xAxisHoveredVariableCode: null});
    if (this.isCollapsed(variable)) {
      this.props.onVariableToggle(variable);
    } else {
      this.tweenState('tweenVariablesPercentage', {
        beginValue: 100,
        duration: 500,
        endValue: 0,
        onEnd: () => {
          this.props.onVariableToggle(variable);
        }
      });
    }
  },
  handleXAxisLabelledVariableHover: function(variable) {
    this.setState({xAxisHoveredVariableCode: variable ? variable.code : null});
    this.handleVariableHover(variable);
  },
  isCollapsed: function(variable) {
    return variable.code in this.props.collapsedVariables && this.props.collapsedVariables[variable.code];
  },
  render: function() {
    var variables = this.getVariables();
    var waterfallBarsVariables = this.state.displaySubtotalThinBars ? variables :
      Lazy(variables).filter(variable => ! variable.isSubtotal || variable.isCollapsed).toArray();
    var yBounds = this.computeValuesBounds(variables);
    var ySmartValues = axes.smartValues(yBounds.minValue, yBounds.maxValue, this.props.yNbSteps);
    var xLabels = waterfallBarsVariables.map(variable => {
      var style = {};
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
        props.onClick = this.handleVariableToggle.bind(null, variable);
      }
      return {name, props, style};
    });
    var gridHeight = this.props.height - this.props.xAxisHeight - this.props.marginTop,
      gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    var stepWidth = gridWidth / xLabels.length;
    var xAxisTransform = `translate(${this.props.yAxisWidth}, ${this.props.height - this.props.xAxisHeight})`;
    var activeVariablesCodes = Lazy([this.state.activeVariableCode]).concat(this.state.activeVariableChildrenCodes)
      .compact().toArray();
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
              height={gridHeight}
              maxValue={ySmartValues.maxValue}
              minValue={ySmartValues.minValue}
              noColorFill={this.props.noColorFill}
              tweenVariables={this.state.activeVariableChildrenCodes}
              tweenVariablesPercentage={this.getTweeningValue('tweenVariablesPercentage')}
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
          {this.state.activeVariableCode ? this.formatHint(variables) : 'Survolez le graphique'}
        </p>
        <VariablesTree
          activeVariablesCodes={activeVariablesCodes}
          formatNumber={this.props.formatNumber}
          hoveredVariableCode={this.state.variablesTreeHoveredVariableCode}
          noColorFill={this.props.noColorFill}
          onToggle={this.handleVariableToggle}
          onHover={this.handleVariablesTreeVariableHover}
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
