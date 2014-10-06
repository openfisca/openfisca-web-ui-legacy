/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  ReactIntlMixin = require('react-intl');

var BaremeChart = require('./svg/bareme-chart'),
  helpers = require('../../helpers'),
  TwoColumnsLayout = require('./two-columns-layout'),
  VariablesTree = require('./variables-tree');

var cx = React.addons.classSet,
  obj = helpers.obj;


var BaremeVisualization = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    chartAspectRatio: React.PropTypes.number.isRequired,
    collapsedVariables: React.PropTypes.object,
    displayParametersColumn: React.PropTypes.bool,
    displaySubtotals: React.PropTypes.bool,
    displayVariablesColors: React.PropTypes.bool,
    formatNumber: React.PropTypes.func.isRequired,
    labelsFontSize: React.PropTypes.number,
    maxHeightRatio: React.PropTypes.number.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onSettingsChange: React.PropTypes.func.isRequired,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
    xMaxValue: React.PropTypes.number.isRequired,
    xMinValue: React.PropTypes.number.isRequired,
  },
  componentDidMount: function() {
    window.onresize = this.handleWidthChange;
    this.handleWidthChange();
  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.displayParametersColumn !== this.props.displayParametersColumn) {
      this.handleWidthChange();
    }
  },
  componentWillUnmount: function() {
    window.onresize = null;
  },
  formatHint: function(variables) {
    var variableName;
    if (this.state.activeVariableCode) {
      var variable = Lazy(variables).find({code: this.state.activeVariableCode});
      variableName = variable.name;
    } else {
      variableName = this.getIntlMessage('hoverOverChart');
    }
    return variableName;
  },
  getDefaultProps: function() {
    return {
      chartAspectRatio: 4/3,
      collapsedVariables: {},
      maxHeightRatio: 2/3,
      noColorFill: 'gray',
    };
  },
  getInitialState: function() {
    return {
      activeVariableCode: null,
      chartColumnWidth: null,
    };
  },
  getVariables: function() {
    var processNode = (variable, baseValues, depth, hidden) => {
      var newVariables = [];
      var isCollapsed = this.isCollapsed(variable);
      if (variable.children) {
        var childrenVariables = [];
        var childBaseValues = baseValues;
        Lazy(variable.children).each(function(child) {
          var childVariables = processNode(child, childBaseValues, depth + 1, hidden || isCollapsed);
          childrenVariables = childrenVariables.concat(childVariables);
          childBaseValues = Lazy(childBaseValues).zip(child.values)
            .map(pair => Lazy(pair).sum()).toArray();
        });
        newVariables = newVariables.concat(childrenVariables);
      }
      var hasValue = Lazy(variable.values).any(function(value) { return value !== 0; });
      if (! hidden && hasValue) {
        var newVariableSequence = Lazy(variable).omit(['children']);
        var hasChildren = !! variable.children;
        newVariableSequence = newVariableSequence.assign({
          baseValues: baseValues,
          depth: depth,
          hasChildren: hasChildren,
          isCollapsed: isCollapsed,
          isSubtotal: hasChildren && depth > 0,
        });
        var newVariable = newVariableSequence.toObject();
        newVariables.push(newVariable);
      }
      return newVariables;
    };
    var initBaseValues = Lazy.repeat(0, this.props.variablesTree.values.length).toArray();
    var variables = processNode(this.props.variablesTree, initBaseValues, 0, false);
    return variables;
  },
  handleDisplayParametersColumnClick: function() {
    this.props.onSettingsChange({displayParametersColumn: ! this.props.displayParametersColumn});
  },
  handleVariableHover: function(variable) {
    this.setState({activeVariableCode: variable ? variable.code : null});
  },
  handleVariableToggle: function (variable) {
    this.props.onSettingsChange({
      collapsedVariables: obj(variable.code, ! this.props.collapsedVariables[variable.code]),
    });
  },
  handleWidthChange: function() {
    var width = this.refs.chartColumn.getDOMNode().offsetWidth;
    var height = this.props.height || width / this.props.chartAspectRatio,
      maxHeight = window.innerHeight * this.props.maxHeightRatio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.props.chartAspectRatio;
    }
    this.setState({chartColumnWidth: width});
  },
  handleXValuesChange: function (xMinValue, xMaxValue) {
    this.props.onSettingsChange({xMinValue, xMaxValue}, true);
  },
  isCollapsed: function(variable) {
    return variable.code in this.props.collapsedVariables && this.props.collapsedVariables[variable.code];
  },
  render: function() {
    var variables = this.getVariables();
    return (
      <TwoColumnsLayout
        leftComponentRef={'chartColumn'}
        rightComponentRef={this.props.displayParametersColumn ? 'parametersColumn' : null}>
        <div ref='chartColumn'>
          {
            this.state.chartColumnWidth && (
              <div>
                <p className='clearfix'>
                  <button
                    className={cx({
                      active: this.props.displayParametersColumn,
                      btn: true,
                      'btn-default': true,
                      'pull-right': true,
                    })}
                    onClick={this.handleDisplayParametersColumnClick}>
                    {this.getIntlMessage('settings')}
                  </button>
                </p>
                <BaremeChart
                  activeVariableCode={this.state.activeVariableCode}
                  formatNumber={this.props.formatNumber}
                  onVariableHover={this.handleVariableHover}
                  onVariableToggle={this.handleVariableToggle}
                  onXValuesChange={this.handleXValuesChange}
                  variables={variables}
                  width={this.state.chartColumnWidth}
                  xMaxValue={this.props.xMaxValue}
                  xMinValue={this.props.xMinValue}
                />
                <p className='text-center well'>
                  {this.formatHint(variables)}
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
                displayVariablesColors={true}
                displayVariablesValues={false}
                formatNumber={this.props.formatNumber}
                negativeColor={this.props.negativeColor}
                noColorFill={this.props.noColorFill}
                onVariableHover={this.handleVariableHover}
                onVariableToggle={this.handleVariableToggle}
                positiveColor={this.props.positiveColor}
                variables={variables}
              />
            </div>
          </div>
        </div>
      </TwoColumnsLayout>
    );
  },
});

module.exports = BaremeVisualization;
