/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons');

var BaremeChart = require('./svg/bareme-chart'),
  TwoColumnsLayout = require('./two-columns-layout'),
  VariablesTree = require('./variables-tree');

var cx = React.addons.classSet;


var BaremeVisualization = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  propTypes: {
    collapsedVariables: React.PropTypes.object.isRequired,
    formatNumber: React.PropTypes.func.isRequired,
    labelsFontSize: React.PropTypes.number,
    noColorFill: React.PropTypes.string.isRequired,
    onVariableToggle: React.PropTypes.func.isRequired,
    onXValuesChange: React.PropTypes.func.isRequired,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
    xMaxValue: React.PropTypes.number.isRequired,
    xMinValue: React.PropTypes.number.isRequired,
  },
  componentDidMount: function() {
    window.onresize = this.handleLayoutChange;
    this.handleLayoutChange();
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
      variableName = 'Survolez le graphique';
    }
    return variableName;
  },
  getDefaultProps: function() {
    return {
      noColorFill: 'gray',
    };
  },
  getInitialState: function() {
    return {
      activeVariableCode: null,
      displayParametersColumn: false,
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
    this.setState({displayParametersColumn: ! this.state.displayParametersColumn}, this.handleLayoutChange);
  },
  handleLayoutChange: function() {
    var chartColumnNode = this.refs.chartColumn.getDOMNode();
    this.setState({chartColumnWidth: chartColumnNode.offsetWidth});
  },
  handleVariableHover: function(variable) {
    this.setState({activeVariableCode: variable ? variable.code : null});
  },
  isCollapsed: function(variable) {
    return variable.code in this.props.collapsedVariables && this.props.collapsedVariables[variable.code];
  },
  render: function() {
    var variables = this.getVariables();
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
                    Paramètres
                  </button>
                </p>
                <BaremeChart
                  activeVariableCode={this.state.activeVariableCode}
                  formatNumber={this.props.formatNumber}
                  onVariableHover={this.handleVariableHover}
                  onVariableToggle={this.props.onVariableToggle}
                  onXValuesChange={this.props.onXValuesChange}
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
              Décomposition des variables
            </div>
            <div className='panel-body'>
              <VariablesTree
                activeVariableCode={this.state.activeVariableCode}
                displayVariablesColors={true}
                formatNumber={this.props.formatNumber}
                hoveredVariableCode={this.state.hoveredVariableCode}
                negativeColor={this.props.negativeColor}
                noColorFill={this.props.noColorFill}
                onVariableHover={this.handleVariableHover}
                onVariableToggle={this.props.onVariableToggle}
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
