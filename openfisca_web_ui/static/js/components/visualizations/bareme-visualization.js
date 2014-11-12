/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  ReactIntlMixin = require('react-intl'),
  saveAs = require('filesaver.js');

var BaremeChart = require('./svg/bareme-chart'),
  BaremeXAxisBoundsSelector = require('./bareme-x-axis-bounds-selector'),
  helpers = require('../../helpers'),
  ReformSelector = require('./reform-selector'),
  TwoColumnsLayout = require('./two-columns-layout'),
  VariablesTree = require('./variables-tree'),
  VisualizationSelect = require('./visualization-select');

var obj = helpers.obj;


var BaremeVisualization = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    chartAspectRatio: React.PropTypes.number.isRequired,
    collapsedVariables: React.PropTypes.object,
    defaultXMaxValue: React.PropTypes.number.isRequired,
    defaultXMinValue: React.PropTypes.number.isRequired,
    displayParametersColumn: React.PropTypes.bool,
    displaySubtotals: React.PropTypes.bool,
    displayVariablesColors: React.PropTypes.bool,
    downloadAttribution: React.PropTypes.string,
    formatNumber: React.PropTypes.func.isRequired,
    labelsFontSize: React.PropTypes.number,
    maxHeightRatio: React.PropTypes.number.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onDownload: React.PropTypes.func.isRequired,
    onReformChange: React.PropTypes.func.isRequired,
    onSettingsChange: React.PropTypes.func.isRequired,
    onVisualizationChange: React.PropTypes.func.isRequired,
    reform: React.PropTypes.string,
    variablesTree: React.PropTypes.object.isRequired,
    visualizationSlug: React.PropTypes.string.isRequired,
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
      defaultXMaxValue: 20000,
      defaultXMinValue: 0,
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
    var isDiff = this.props.reform === 'plfrss2014-diff';
    var diffValues = values => {
      var referenceValues = values.slice(0, values.length / 2),
        reformValues = values.slice(values.length / 2, values.length);
      return reformValues.map((value, index) => value - referenceValues[index]);
    };
    var processNode = (variable, baseValues, depth, hidden) => {
      var newVariables = [];
      var isCollapsed = this.isCollapsed(variable);
      if (variable.children) {
        var childrenVariables = [];
        var childBaseValues = baseValues;
        Lazy(variable.children).each(child => {
          var childVariables = processNode(child, childBaseValues, depth + 1, hidden || isCollapsed);
          childrenVariables = childrenVariables.concat(childVariables);
          var values = isDiff ? diffValues(child.values) : child.values.slice(sliceStart, sliceEnd);
          childBaseValues = Lazy(childBaseValues).zip(values).map(pair => Lazy(pair).sum()).toArray();
        });
        newVariables = newVariables.concat(childrenVariables);
      }
      var values = isDiff ? diffValues(variable.values) : variable.values.slice(sliceStart, sliceEnd);
      var hasValue = Lazy(values).any(value => value !== 0);
      if (! hidden && hasValue) {
        var newVariableSequence = Lazy(variable).omit(['children']);
        var hasChildren = !! variable.children;
        newVariableSequence = newVariableSequence.assign({
          baseValues: baseValues,
          depth: depth,
          hasChildren: hasChildren,
          isCollapsed: isCollapsed,
          isSubtotal: hasChildren && depth > 0,
          values: values,
        });
        var newVariable = newVariableSequence.toObject();
        newVariables.push(newVariable);
      }
      return newVariables;
    };
    var values = this.props.variablesTree.values;
    var valuesLength = this.props.variablesTree.values.length;
    if ( ! isDiff) {
      var sliceStart = this.props.reform ? valuesLength / 2 : 0;
      var sliceEnd = this.props.reform ? valuesLength : valuesLength / 2;
    }
    var initBaseValues = Lazy.repeat(0, values.length / 2).toArray();
    var variables = processNode(this.props.variablesTree, initBaseValues, 0, false);
    return variables;
  },
  handleDisplayParametersColumnClick: function() {
    this.props.onSettingsChange({displayParametersColumn: ! this.props.displayParametersColumn});
  },
  handleChartDownload: function() {
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
          <ReformSelector onChange={this.props.onReformChange} value={this.props.reform} />
          <button
            className='btn btn-default hidden-sm hidden-xs pull-right'
            onClick={this.handleDisplayParametersColumnClick}>
            {
              this.props.displayParametersColumn ?
                this.getIntlMessage('hideDetails') :
                this.getIntlMessage('showDetails')
            }
          </button>
          <hr/>
          <div>
            {
              this.state.chartColumnWidth && (
                <div className='panel panel-default'>
                  <div className='panel-heading'>
                    <div className="form-inline">
                      <VisualizationSelect
                        onChange={this.props.onVisualizationChange}
                        value={this.props.visualizationSlug}
                      />
                    </div>
                  </div>
                  <div className='list-group-item'>
                    <BaremeChart
                      activeVariableCode={this.state.activeVariableCode}
                      formatNumber={this.props.formatNumber}
                      onVariableHover={this.handleVariableHover}
                      onVariableToggle={this.handleVariableToggle}
                      ref='chart'
                      variables={variables}
                      width={this.state.chartColumnWidth - 15 * 2 /* bootstrap adds 15px padding to panel-body */}
                      xMaxValue={this.props.xMaxValue}
                      xMinValue={this.props.xMinValue}
                    />
                  </div>
                  <div className='list-group-item'>
                    {variables && this.formatHint(variables)}
                  </div>
                  <div className='list-group-item'>
                    <BaremeXAxisBoundsSelector
                      defaultXMaxValue={this.props.defaultXMaxValue}
                      defaultXMinValue={this.props.defaultXMinValue}
                      onSettingsChange={this.props.onSettingsChange}
                      xMaxValue={this.props.xMaxValue}
                      xMinValue={this.props.xMinValue}
                    />
                  </div>
                </div>
              )
            }
          </div>
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
                variableHeightByCode={{revdisp: 5}}
                variables={variables}
              />
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
                  <button className='btn btn-default btn-sm' onClick={() => this.props.onDownload('testCase', 'json')}>
                    JSON
                  </button>
                </p>
              </div>
              <div className='list-group-item'>
                <p>
                  <span style={{marginRight: '1em'}}>{this.getIntlMessage('simulationResult')}</span>
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
                  <button className='btn btn-default btn-sm' onClick={this.handleChartDownload}>SVG</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </TwoColumnsLayout>
    );
  },
});

module.exports = BaremeVisualization;
