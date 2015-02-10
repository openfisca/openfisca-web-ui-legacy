/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  ReactIntlMixin = require('react-intl'),
  saveAs = require('filesaver.js');

var BaremeChart = require('./svg/bareme-chart'),
  BaremeSettings = require('./bareme-settings'),
  decompositions = require('../../decompositions'),
  VariablesTree = require('./variables-tree'),
  VisualizationSelect = require('./visualization-select');


var BaremeVisualization = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    baseVariablesTree: React.PropTypes.object,
    chartAspectRatio: React.PropTypes.number.isRequired,
    collapsedVariables: React.PropTypes.object,
    columns: React.PropTypes.object.isRequired,
    defaultProps: React.PropTypes.object.isRequired,
    disabled: React.PropTypes.bool,
    displayBisectrix: React.PropTypes.bool,
    displaySettings: React.PropTypes.bool,
    downloadAttribution: React.PropTypes.string,
    formatNumber: React.PropTypes.func.isRequired,
    isChartFullWidth: React.PropTypes.bool,
    isSimulationInProgress: React.PropTypes.bool,
    labelsFontSize: React.PropTypes.number,
    loadingIndicatorElement: React.PropTypes.element.isRequired,
    maxHeightRatio: React.PropTypes.number.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onDownload: React.PropTypes.func.isRequired,
    onSettingsChange: React.PropTypes.func.isRequired,
    onVisualizationChange: React.PropTypes.func.isRequired,
    reformMode: React.PropTypes.string.isRequired,
    variablesTree: React.PropTypes.object,
    visualizationSlug: React.PropTypes.string.isRequired,
    xAxisVariableCode: React.PropTypes.string.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xMinValue: React.PropTypes.number.isRequired,
  },
  componentDidMount() {
    window.onresize = this.handleWidthChange;
    this.handleWidthChange();
  },
  componentDidUpdate(prevProps) {
    if (prevProps.isChartFullWidth !== this.props.isChartFullWidth) {
      this.handleWidthChange();
    }
  },
  componentWillUnmount() {
    window.onresize = null;
  },
  formatHint(variables) {
    var variableName;
    if (this.state.activeVariableCode) {
      var variable = Lazy(variables).find({code: this.state.activeVariableCode});
      variableName = variable.name;
    } else {
      variableName = this.getIntlMessage('hoverOverChart');
    }
    return variableName;
  },
  getDefaultProps() {
    return {
      chartAspectRatio: 4/3,
      collapsedVariables: {},
      maxHeightRatio: 2/3,
      noColorFill: 'gray',
    };
  },
  getInitialState() {
    return {
      activeVariableCode: null,
      chartContainerWidth: null,
    };
  },
  getVariables(rootVariable) {
    var isVariableCollapsed = (variable) => variable.code in this.props.collapsedVariables &&
      this.props.collapsedVariables[variable.code];
    var walk = (variable, baseValues, depth, hidden) => {
      var newVariables = [];
      var isCollapsed = isVariableCollapsed(variable);
      var hasChildren = Boolean(variable.children && variable.children.length);
      if (hasChildren) {
        var childrenVariables = [];
        var childBaseValues = baseValues;
        variable.children.forEach((child) => {
          var childVariables = walk(child, childBaseValues, depth + 1, hidden || isCollapsed);
          if (childVariables.length) {
            childrenVariables = childrenVariables.concat(childVariables);
          }
          childBaseValues = Lazy(childBaseValues).zip(child.values).map((pair) => Lazy(pair).sum()).toArray();
        });
        newVariables = newVariables.concat(childrenVariables);
      }
      var hasValue = Lazy(variable.values).any(value => value !== 0);
      if (! hidden && hasValue) {
        var newVariableSequence = Lazy(variable).omit(['children']);
        newVariableSequence = newVariableSequence.assign({
          baseValues: baseValues,
          depth: depth,
          hasChildren: hasChildren,
          isCollapsed: isCollapsed,
          isSubtotal: hasChildren && depth > 0,
          values: variable.values,
        });
        var newVariable = newVariableSequence.toObject();
        newVariables.push(newVariable);
      }
      return newVariables;
    };
    var initBaseValues = Lazy.repeat(0, rootVariable.values.length).toArray();
    var variables = walk(rootVariable, initBaseValues, 0, false);
    return variables;
  },
  handleChartDownload() {
    var newProps = Lazy(this.refs.chart.props).omit(['ref']).assign({
      attribution: this.props.downloadAttribution,
      height: null,
      width: 800,
    }).toObject();
    var svgString = React.renderComponentToStaticMarkup(BaremeChart(newProps));
    saveAs(
      new Blob([svgString], {type: "image/svg+xml"}),
      this.formatMessage(this.getIntlMessage('baremeFilename'), {extension: 'svg'})
    );
  },
  handleVariableHover(variable) {
    this.setState({activeVariableCode: variable ? variable.code : null});
  },
  handleVariableToggle (variable) {
    this.props.onSettingsChange({
      collapsedVariables: {[variable.code]: ! this.props.collapsedVariables[variable.code]},
    });
  },
  handleWidthChange() {
    var chartContainerDOMNode = this.refs.chartContainer.getDOMNode();
    var width = chartContainerDOMNode.offsetWidth;
    var height = this.props.height || width / this.props.chartAspectRatio,
      maxHeight = window.innerHeight * this.props.maxHeightRatio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.props.chartAspectRatio;
    }
    this.setState({chartContainerWidth: width});
  },
  render() {
    var variables;
    if (this.props.variablesTree) {
      var rootVariable;
      if (this.props.reformMode === 'difference') {
        var mergedVariablesTree = decompositions.mergeNodes(this.props.baseVariablesTree, this.props.variablesTree);
        rootVariable = mergedVariablesTree;
      } else {
        rootVariable = this.props.reformMode === 'with' ? this.props.variablesTree : this.props.baseVariablesTree;
      }
      variables = this.getVariables(rootVariable);
    }
    // Substract Bootstrap panel left and right paddings.
    var baremeChartWidth = this.state.chartContainerWidth - 15 * 2;
    return (
      <div>
        <div className={this.props.isChartFullWidth ? null : 'col-lg-7'}>
          <div className='panel panel-default'>
              <div className='panel-heading'>
                <div className="form-inline">
                  <VisualizationSelect
                    disabled={this.props.disabled}
                    onChange={this.props.onVisualizationChange}
                    value={this.props.visualizationSlug}
                  />
                  <div className='checkbox pull-right visible-lg-inline'>
                    <label>
                      <input
                        checked={this.props.isChartFullWidth}
                        onChange={event => this.props.onSettingsChange({isChartFullWidth: event.target.checked})}
                        type='checkbox'
                      />
                      {' '}
                      {this.getIntlMessage('fullWidth')}
                    </label>
                  </div>
                </div>
              </div>
              <div className='list-group-item' ref='chartContainer'>
                {
                  this.state.chartContainerWidth && variables ? (
                    <BaremeChart
                      activeVariableCode={this.state.activeVariableCode}
                      displayBisectrix={this.props.displayBisectrix}
                      formatNumber={this.props.formatNumber}
                      onVariableHover={this.handleVariableHover}
                      ref='chart'
                      variables={variables}
                      width={baremeChartWidth}
                      xAxisLabel={
                        this.props.xAxisVariableCode in this.props.columns ?
                          this.props.columns[this.props.xAxisVariableCode].label :
                          ''
                      }
                      xMaxValue={this.props.xMaxValue}
                      xMinValue={this.props.xMinValue}
                    />
                  ) : (
                    this.props.isSimulationInProgress && this.props.loadingIndicatorElement
                  )
                }
              </div>
              {
                variables && (
                  <div className='list-group-item'>
                    {this.formatHint(variables)}
                  </div>
                )
              }
              <div className='panel-footer'>
                <BaremeSettings
                  columns={this.props.columns}
                  defaultProps={this.props.defaultProps}
                  displayBisectrix={this.props.displayBisectrix}
                  displaySettings={this.props.displaySettings}
                  onSettingsChange={this.props.onSettingsChange}
                  xAxisVariableCode={this.props.xAxisVariableCode}
                  xMaxValue={this.props.xMaxValue}
                  xMinValue={this.props.xMinValue}
                />
              </div>
            </div>
        </div>
        <div className={this.props.isChartFullWidth ? null : 'col-lg-5'}>
          <div className='panel panel-default'>
            <div className='panel-heading'>
              {this.getIntlMessage('variablesDecomposition')}
            </div>
            <div className='panel-body'>
              {
                variables ? (
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
                    variableHeightByCode={{revdisp: 5}}
                    variables={variables}
                  />
                ) : (
                  this.props.isSimulationInProgress && this.props.loadingIndicatorElement
                )
              }
            </div>
          </div>
          <div className='panel panel-default'>
            <div className='panel-heading'>
              {this.getIntlMessage('dataExport')}
            </div>
            {
              variables ? (
                <div className='list-group'>
                  <div className='list-group-item'>
                    <p>
                      <span style={{marginRight: '1em'}}>{this.getIntlMessage('testCase')}</span>
                      <button
                        className='btn btn-default btn-sm'
                        onClick={() => this.props.onDownload('testCase', 'json')}
                      >
                        JSON
                      </button>
                    </p>
                  </div>
                  <div className='list-group-item'>
                    <p>
                      <span style={{marginRight: '1em'}}>
                        {this.getIntlMessage('simulationResult')}
                      </span>
                      <button
                        className='btn btn-default btn-sm'
                        onClick={() => this.props.onDownload('simulationResult', 'json')}
                        style={{marginRight: '1em'}}>
                        JSON
                      </button>
                      <button
                        className='btn btn-default btn-sm'
                        onClick={() => this.props.onDownload('simulationResult', 'csv')}>
                        CSV
                      </button>
                    </p>
                  </div>
                  <div className='list-group-item'>
                    <p>
                      <span style={{marginRight: '1em'}}>{this.getIntlMessage('chart')}</span>
                      <button
                        className='btn btn-default btn-sm'
                        onClick={this.handleChartDownload}
                      >
                        SVG
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className='panel-body'>
                  {this.props.isSimulationInProgress && this.props.loadingIndicatorElement}
                </div>
              )
            }
          </div>
        </div>
      </div>
    );
  },
});

module.exports = BaremeVisualization;
