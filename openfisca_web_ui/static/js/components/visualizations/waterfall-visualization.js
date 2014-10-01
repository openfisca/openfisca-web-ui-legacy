/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  ReactIntlMixin = require('react-intl'),
  TweenState = require('react-tween-state');

var TwoColumnsLayout = require('./two-columns-layout'),
  VariablesTree = require('./variables-tree'),
  WaterfallChart = require('./svg/waterfall-chart');

var cx = React.addons.classSet;


var WaterfallVisualization = React.createClass({
  mixins: [React.addons.LinkedStateMixin, TweenState.Mixin, ReactIntlMixin],
  propTypes: {
    collapsedVariables: React.PropTypes.object.isRequired,
    formatNumber: React.PropTypes.func.isRequired,
    labelsFontSize: React.PropTypes.number,
    negativeColor: React.PropTypes.string.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onVariableToggle: React.PropTypes.func.isRequired,
    positiveColor: React.PropTypes.string.isRequired,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
    // variablesTree.values key is a list. This tells which index to use.
    variablesTreeValueIndex: React.PropTypes.number.isRequired,
  },
  componentDidMount: function() {
    window.onresize = this.handleLayoutChange;
    this.handleLayoutChange();
  },
  componentWillUnmount: function() {
    window.onresize = null;
  },
  formatHint: function(variables) {
    var variable = Lazy(variables).find({code: this.state.activeVariableCode});
    var [startValue, endValue] = [variable.baseValue + variable.value, variable.baseValue].sort();
    if (variable.value < 0) {
      [endValue, startValue] = [startValue, endValue];
    }
    var absoluteValue = this.props.formatNumber(Math.abs(variable.value));
    if (startValue && endValue) {
      return this.formatMessage(this.getIntlMessage('waterfallHintEquation'), {
        absoluteValue: absoluteValue,
        formattedEndValue: this.props.formatNumber(endValue, {fixed: 2}),
        formattedStartValue: this.props.formatNumber(startValue),
        operator: variable.value > 0 ? '+' : '−',
        variableName: variable.name,
      });
    } else {
      return this.formatMessage(this.getIntlMessage('waterfallHintValue'), {
        absoluteValue: absoluteValue,
        variableName: variable.name,
      });
    }
  },
  getDefaultProps: function() {
    return {
      negativeColor: '#d9534f', // Bootstrap danger color
      noColorFill: 'gray',
      positiveColor: '#5cb85c', // Bootstrap success color
      variablesTreeValueIndex: 0,
    };
  },
  getInitialState: function() {
    return {
      activeVariableCode: null,
      chartColumnWidth: null,
      displayParametersColumn: false,
      displaySubtotalThinBars: false,
      displayVariablesColors: false,
      tweenProgress: null,
    };
  },
  handleDisplayParametersColumnClick: function() {
    this.setState({displayParametersColumn: ! this.state.displayParametersColumn}, this.handleLayoutChange);
  },
  handleLayoutChange: function() {
    var chartColumnNode = this.refs.chartColumn.getDOMNode();
    this.setState({chartColumnWidth: chartColumnNode.offsetWidth});
  },
  handleVariableHover: function(variable) {
    this.setState({activeVariableCode: variable ? variable.code : null});
  },
  handleVariableToggle: function(variable) {
    if (variable.isCollapsed) {
      this.props.onVariableToggle(variable);
    }
    this.tweenState('tweenProgress', {
      beginValue: variable.isCollapsed ? 1 : 0,
      duration: 500,
      endValue: variable.isCollapsed ? 0 : 1,
      onEnd: () => {
        this.setState({tweenProgress: null});
        if ( ! variable.isCollapsed) {
          this.props.onVariableToggle(variable);
        }
      },
    });
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
    var waterfallChartVariables = this.state.displaySubtotalThinBars ? displayedVariablesWithSubtotals :
      displayedVariablesWithoutSubtotals;
    var variablesTreeVariables = displayedVariablesWithSubtotals;
    var activeVariablesCodes = null;
    if (this.state.activeVariableCode) {
      activeVariablesCodes = [this.state.activeVariableCode];
      if (this.state.activeVariableCode !== 'revdisp') {
        var activeVariable = displayedVariablesWithSubtotals.find(_ => _.code === this.state.activeVariableCode);
        activeVariablesCodes = activeVariablesCodes.concat(activeVariable.childrenCodes);
      }
      activeVariablesCodes = activeVariablesCodes.intersection(waterfallChartVariables.map(_ => _.code));
    }
    return (
      <TwoColumnsLayout
        leftComponentRef={'chartColumn'}
        rightComponentRef={this.state.displayParametersColumn ? 'parametersColumn' : null}>
        <div ref='chartColumn'>
          {
            this.state.chartColumnWidth && (
              <div>
                <p className='clearfix'>
                  <button
                    className={cx({
                      active: this.state.displayParametersColumn,
                      btn: true,
                      'btn-default': true,
                      'pull-right': true,
                    })}
                    onClick={this.handleDisplayParametersColumnClick}>
                    {this.getIntlMessage('settings')}
                  </button>
                </p>
                <WaterfallChart
                  activeVariablesCodes={activeVariablesCodes}
                  displayVariablesColors={this.state.displayVariablesColors}
                  formatNumber={this.props.formatNumber}
                  labelsFontSize={this.props.labelsFontSize}
                  negativeColor={this.props.negativeColor}
                  noColorFill={this.props.noColorFill}
                  onVariableHover={this.handleVariableHover}
                  onVariableToggle={this.state.tweenProgress === null ? this.handleVariableToggle : null}
                  positiveColor={this.props.positiveColor}
                  tweenProgress={this.getTweeningValue('tweenProgress')}
                  variables={waterfallChartVariables}
                  width={this.state.chartColumnWidth}
                />
                <p className='text-center well'>
                  {
                    this.state.activeVariableCode ?
                      this.formatHint(variablesWithSubtotals) :
                      this.getIntlMessage('hoverOverChart')
                  }
                </p>
              </div>
            )
          }
        </div>
        <div ref='parametersColumn'>
          <div className='panel panel-default'>
            <div className='panel-heading'>
              {this.getIntlMessage('variablesDecomposition')}
            </div>
            <div className='panel-body'>
              <VariablesTree
                activeVariableCode={this.state.activeVariableCode}
                displayVariablesColors={this.state.displayVariablesColors}
                formatNumber={this.props.formatNumber}
                hoveredVariableCode={this.state.hoveredVariableCode}
                negativeColor={this.props.negativeColor}
                noColorFill={this.props.noColorFill}
                onVariableHover={this.state.tweenProgress === null ? this.handleVariableHover : null}
                onVariableToggle={this.state.tweenProgress === null ? this.handleVariableToggle : null}
                positiveColor={this.props.positiveColor}
                variables={variablesTreeVariables}
              />
            </div>
          </div>
          <div className='panel panel-default'>
            <div className='panel-heading'>
              {this.getIntlMessage('advancedSettings')}
            </div>
            <div className='panel-body'>
              <div className='checkbox'>
                <label>
                  <input checkedLink={this.linkState('displaySubtotalThinBars')} type='checkbox' />
                  {this.getIntlMessage('displaySubtotals')}
                </label>
              </div>
              <div className='checkbox'>
                <label>
                  <input checkedLink={this.linkState('displayVariablesColors')} type='checkbox' />
                  {this.getIntlMessage('displayVariablesColors')}
                </label>
              </div>
            </div>
          </div>
        </div>
      </TwoColumnsLayout>
    );
  },
});

module.exports = WaterfallVisualization;
