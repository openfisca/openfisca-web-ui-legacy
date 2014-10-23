/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  ReactIntlMixin = require('react-intl'),
  saveAs = require('filesaver.js'),
  TweenState = require('react-tween-state');

var helpers = require('../../helpers'),
  TwoColumnsLayout = require('./two-columns-layout'),
  VariablesTree = require('./variables-tree'),
  WaterfallChart = require('./svg/waterfall-chart');

var cx = React.addons.classSet,
  obj = helpers.obj;


var WaterfallVisualization = React.createClass({
  mixins: [TweenState.Mixin, ReactIntlMixin],
  propTypes: {
    chartAspectRatio: React.PropTypes.number.isRequired,
    collapsedVariables: React.PropTypes.object,
    diff: React.PropTypes.bool,
    displayParametersColumn: React.PropTypes.bool,
    displaySubtotals: React.PropTypes.bool,
    displayVariablesColors: React.PropTypes.bool,
    downloadAttribution: React.PropTypes.string,
    formatNumber: React.PropTypes.func.isRequired,
    labelsFontSize: React.PropTypes.number,
    maxHeightRatio: React.PropTypes.number.isRequired,
    negativeColor: React.PropTypes.string.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onDownload: React.PropTypes.func.isRequired,
    onSettingsChange: React.PropTypes.func.isRequired,
    positiveColor: React.PropTypes.string.isRequired,
    valuesOffset: React.PropTypes.number,
    variablesTree: React.PropTypes.object.isRequired, // OpenFisca API simulation results.
  },
  componentDidMount: function() {
    window.onresize = this.handleWidthChange;
    this.handleWidthChange();
  },
  componentWillUnmount: function() {
    window.onresize = null;
  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.displayParametersColumn !== this.props.displayParametersColumn) {
      this.handleWidthChange();
    }
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
      chartAspectRatio: 4/3,
      collapsedVariables: {},
      maxHeightRatio: 2/3,
      negativeColor: '#d9534f', // Bootstrap danger color
      noColorFill: 'gray',
      positiveColor: '#5cb85c', // Bootstrap success color
    };
  },
  getInitialState: function() {
    return {
      activeVariableCode: null,
      chartColumnWidth: null,
      tweenProgress: null,
    };
  },
  handleChartDownload: function() {
    var newProps = Lazy(this.refs.chart.props).omit(['ref']).assign({
      attribution: this.props.downloadAttribution,
      height: null,
      width: 800,
    }).toObject();
    var svgString = React.renderComponentToStaticMarkup(WaterfallChart(newProps));
    saveAs(
      new Blob([svgString], {type: "image/svg+xml"}),
      this.formatMessage(this.getIntlMessage('waterfallFilename'), {extension: 'svg'})
    );
  },
  handleDisplayParametersColumnClick: function() {
    this.props.onSettingsChange({displayParametersColumn: ! this.props.displayParametersColumn});
  },
  handleVariableHover: function(variable) {
    this.setState({activeVariableCode: variable ? variable.code : null});
  },
  handleVariableToggle: function(variable) {
    if (variable.isCollapsed) {
      var newSettings = {
        collapsedVariables: obj(variable.code, ! this.props.collapsedVariables[variable.code]),
      };
      this.props.onSettingsChange(newSettings);
    }
    this.tweenState('tweenProgress', {
      beginValue: variable.isCollapsed ? 1 : 0,
      duration: 500,
      endValue: variable.isCollapsed ? 0 : 1,
      onEnd: () => {
        this.setState({tweenProgress: null});
        if ( ! variable.isCollapsed) {
          var newSettings = {
            collapsedVariables: obj(variable.code, ! this.props.collapsedVariables[variable.code]),
          };
          this.props.onSettingsChange(newSettings);
        }
      },
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
  linearizeVariables: function() {
    // Transform this.props.variablesTree into an array and compute base values for waterfall.
    // Also rename snake case keys to camel case.
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
          if ( ! this.props.diff) {
            childBaseValue += child.values[this.props.valuesOffset];
          }
        });
        newVariables = newVariables.concat(childrenVariables);
      }
      var value;
      if (this.props.diff) {
        value = variable.values[1] - variable.values[0];
      } else {
        value = variable.values[this.props.valuesOffset];
      }
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
          values: variable.values,
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
    var removedVariablesCodes = removeChildren ?
      variables.filter(isRemoved).map(variable => variable.childrenCodes).flatten().uniq() :
      variables.filter(isRemoved).map(variable => variable.code);
    return variables
      .filter(variable => ! removedVariablesCodes.contains(variable.code))
      .map(variable => variable.childrenCodes ? Lazy(variable).assign({
        childrenCodes: variable.childrenCodes.diff(removedVariablesCodes)
      }).toObject() : variable);
  },
  render: function() {
    var linearizedVariables = this.linearizeVariables();
    var hasOnlyZeroValues = variable => Math.max.apply(null, variable.values.map(Math.abs)) === 0;
    var isSubtotal = variable => variable.isSubtotal && ! variable.isCollapsed;
    var isCollapsed = variable => variable.isCollapsed;
    var variablesWithSubtotals = this.removeVariables(linearizedVariables, hasOnlyZeroValues);
    var variablesWithoutSubtotals = this.removeVariables(variablesWithSubtotals, isSubtotal);
    var displayedVariablesWithSubtotals = this.removeVariables(variablesWithSubtotals, isCollapsed, true);
    var displayedVariablesWithoutSubtotals = this.removeVariables(variablesWithoutSubtotals, isCollapsed, true);
    var waterfallChartVariables = this.props.displaySubtotals ? displayedVariablesWithSubtotals :
      displayedVariablesWithoutSubtotals;
    var variablesTreeVariables = displayedVariablesWithSubtotals;
    var activeVariablesCodes = null;
    var activeVariable;
    if (this.state.activeVariableCode) {
      activeVariable = displayedVariablesWithSubtotals.find(_ => _.code === this.state.activeVariableCode);
      if (activeVariable) {
        activeVariablesCodes = [this.state.activeVariableCode];
        if (this.state.activeVariableCode !== 'revdisp') {
          activeVariablesCodes = activeVariablesCodes.concat(activeVariable.childrenCodes);
        }
        activeVariablesCodes = activeVariablesCodes.intersection(waterfallChartVariables.map(_ => _.code));
      }
    }
    return (
      <TwoColumnsLayout
        leftComponentRef={'chartColumn'}
        rightComponentRef={this.props.displayParametersColumn ? 'parametersColumn' : null}>
        <div ref='chartColumn'>
          {
            this.state.chartColumnWidth && (
              <div>
                <WaterfallChart
                  activeVariablesCodes={activeVariablesCodes}
                  displayVariablesColors={this.props.displayVariablesColors}
                  formatNumber={this.props.formatNumber}
                  labelsFontSize={this.props.labelsFontSize}
                  negativeColor={this.props.negativeColor}
                  noColorFill={this.props.noColorFill}
                  onVariableHover={this.handleVariableHover}
                  onVariableToggle={this.state.tweenProgress === null ? this.handleVariableToggle : null}
                  positiveColor={this.props.positiveColor}
                  ref='chart'
                  tweenProgress={this.getTweeningValue('tweenProgress')}
                  variables={waterfallChartVariables}
                  width={this.state.chartColumnWidth}
                />
                <p className='text-center well'>
                  {
                    activeVariable ?
                      this.formatHint(variablesWithSubtotals) :
                      this.getIntlMessage('hoverOverChart')
                  }
                </p>
                <p className='clearfix'>
                  <button
                    className={cx({
                      active: this.props.displayParametersColumn,
                      btn: true,
                      'btn-default': true,
                      'pull-right': true,
                    })}
                    onClick={this.handleDisplayParametersColumnClick}>
                    {this.getIntlMessage('details')}
                  </button>
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
                displayVariablesColors={this.props.displayVariablesColors}
                displayVariablesValues={true}
                formatNumber={this.props.formatNumber}
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
              {this.getIntlMessage('displayParameters')}
            </div>
            <div className='panel-body'>
              <div className='checkbox'>
                <label>
                  <input
                    checked={this.props.displaySubtotals}
                    onChange={event => this.props.onSettingsChange({displaySubtotals: event.target.checked})}
                    type='checkbox'
                  />
                  {this.getIntlMessage('displaySubtotals')}
                </label>
              </div>
              <div className='checkbox'>
                <label>
                  <input
                    checked={this.props.displayVariablesColors}
                    onChange={event => this.props.onSettingsChange({displayVariablesColors: event.target.checked})}
                    type='checkbox'
                  />
                  {this.getIntlMessage('displayVariablesColors')}
                </label>
              </div>
            </div>
          </div>
          <div className='panel panel-default'>
            <div className='panel-heading'>
              {this.getIntlMessage('dataExport')}
            </div>
            <div className='list-group'>
              <div className='list-group-item'>
                <p>
                  <span style={{marginRight: '1em'}}>{this.getIntlMessage('testCase')}</span>
                  <button className='btn btn-default btn-xs' onClick={() => this.props.onDownload('testCase', 'json')}>
                    JSON
                  </button>
                </p>
              </div>
              <div className='list-group-item'>
                <p>
                  <span style={{marginRight: '1em'}}>{this.getIntlMessage('simulationResult')}</span>
                  <button
                    className='btn btn-default btn-xs'
                    onClick={() => this.props.onDownload('simulationResult', 'json')}
                    style={{marginRight: '1em'}}>
                    JSON
                  </button>
                  <button
                    className='btn btn-default btn-xs'
                    onClick={() => this.props.onDownload('simulationResult', 'csv')}
                    >
                    CSV
                  </button>
                </p>
              </div>
              <div className='list-group-item'>
                <p>
                  <span style={{marginRight: '1em'}}>{this.getIntlMessage('chart')}</span>
                  <button className='btn btn-default btn-xs' onClick={this.handleChartDownload}>SVG</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </TwoColumnsLayout>
    );
  },
});

module.exports = WaterfallVisualization;
