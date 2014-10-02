/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var axes = require('../../../axes'),
  HGrid = require('./h-grid'),
  WaterfallBars = require('./waterfall-bars'),
  WaterfallBarHover = require('./waterfall-bar-hover'),
  XAxisLabelled = require('./x-axis-labelled'),
  YAxis = require('./y-axis');


var WaterfallChart = React.createClass({
  propTypes: {
    activeVariablesCodes: React.PropTypes.arrayOf(React.PropTypes.string),
    aspectRatio: React.PropTypes.number.isRequired,
    displayVariablesColors: React.PropTypes.bool,
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number,
    labelsFontSize: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    maxHeightRatio: React.PropTypes.number,
    negativeColor: React.PropTypes.string.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onVariableHover: React.PropTypes.func,
    onVariableToggle: React.PropTypes.func,
    positiveColor: React.PropTypes.string.isRequired,
    tweenProgress: React.PropTypes.number,
    variables: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    yNbSteps: React.PropTypes.number.isRequired,
  },
  computeChartDimensions: function () {
    var width = this.props.width;
    var height = this.props.height || width / this.props.aspectRatio,
      maxHeight = window.innerHeight * this.props.maxHeightRatio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.props.aspectRatio;
    }
    return [width, height];
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
  getDefaultProps: function() {
    return {
      aspectRatio: 4/3,
      marginRight: 10,
      marginTop: 10,
      maxHeightRatio: 2/3,
      negativeColor: 'red',
      noColorFill: 'gray',
      positiveColor: 'green',
      xAxisHeight: 100,
      yAxisWidth: 80,
      yNbSteps: 8,
    };
  },
  getInitialState: function() {
    return {
      hoveredVariableCode: null,
      xAxisHoveredVariableCode: null,
    };
  },
  handleVariableHover: function(variable) {
    this.setState({hoveredVariableCode: variable ? variable.code : null});
    this.props.onVariableHover && this.props.onVariableHover(variable);
  },
  handleXAxisVariableHover: function(variable) {
    this.setState({xAxisHoveredVariableCode: variable ? variable.code : null});
    this.handleVariableHover(variable);
  },
  render: function() {
    var [yAxisMinValue, yAxisMaxValue] = this.determineYAxisRange(this.props.variables);
    if (yAxisMaxValue === yAxisMinValue) {
      yAxisMaxValue = yAxisMinValue + 1;
    }
    var ySmartValues = axes.smartValues(yAxisMinValue, yAxisMaxValue, this.props.yNbSteps);
    var xLabels = this.props.variables.map(variable => {
      var style = {};
      var name = variable.shortName;
      if (variable.isSubtotal) {
        name = (variable.isCollapsed ? '▶' : '▼') + ' ' + name;
        if (variable.code === this.state.xAxisHoveredVariableCode) {
          style.textDecoration = 'underline';
        }
      }
      var props = {
        onMouseOut: this.props.tweenProgress === null ? this.handleXAxisVariableHover.bind(null, null) : null,
        onMouseOver: this.props.tweenProgress === null ? this.handleXAxisVariableHover.bind(null, variable) : null,
      };
      if (this.props.onVariableToggle && variable.isSubtotal) {
        style.cursor = 'pointer';
        props.onClick = this.props.onVariableToggle.bind(null, variable);
      }
      return {name, props, style};
    });
    var [width, height] = this.computeChartDimensions();
    var gridHeight = height - this.props.xAxisHeight - this.props.marginTop,
      gridWidth = width - this.props.yAxisWidth - this.props.marginRight;
    var stepWidth = gridWidth / xLabels.length;
    var xAxisTransform = `translate(${this.props.yAxisWidth}, ${height - this.props.xAxisHeight})`;
    return (
      <svg height={height} width={width}>
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
            activeVariablesCodes={this.props.activeVariablesCodes}
            displayVariablesColors={this.props.displayVariablesColors}
            height={gridHeight}
            maxValue={ySmartValues.maxValue}
            minValue={ySmartValues.minValue}
            negativeColor={this.props.negativeColor}
            noColorFill={this.props.noColorFill}
            positiveColor={this.props.positiveColor}
            tweenProgress={this.props.tweenProgress}
            variables={this.props.variables}
            width={gridWidth}
          />
          {
            this.props.tweenProgress === null && this.props.variables.map((variable, idx) =>
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
    );
  },
});

module.exports = WaterfallChart;
