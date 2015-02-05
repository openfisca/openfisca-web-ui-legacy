/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react'),
  ReactIntlMixin = require('react-intl');

var axes = require('../../../axes'),
  Curve = require('./curve'),
  HGrid = require('./h-grid'),
  VGrid = require('./v-grid'),
  XAxis = require('./x-axis'),
  YAxis = require('./y-axis');


var BaremeChart = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    activeVariableCode: React.PropTypes.string,
    aspectRatio: React.PropTypes.number.isRequired,
    attribution: React.PropTypes.string,
    defaultYAxisWidth: React.PropTypes.number.isRequired,
    displayBisectrix: React.PropTypes.bool,
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number,
    labelsFontSize: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onVariableHover: React.PropTypes.func.isRequired,
    variables: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    xAxisLabel: React.PropTypes.string.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xMinValue: React.PropTypes.number.isRequired,
    xNbSteps: React.PropTypes.number.isRequired,
    yNbSteps: React.PropTypes.number.isRequired,
  },
  componentDidMount: function() {
    var yAxisDOMNode = this.refs.yAxis.getDOMNode();
    var newYAxisWidth = Math.ceil(yAxisDOMNode.getBoundingClientRect().width);
    this.setState({yAxisWidth: newYAxisWidth});
  },
  componentDidUpdate: function() {
    var yAxisDOMNode = this.refs.yAxis.getDOMNode();
    var newYAxisWidth = Math.ceil(yAxisDOMNode.getBoundingClientRect().width);
    if (newYAxisWidth !== this.state.yAxisWidth) {
      this.setState({yAxisWidth: newYAxisWidth});
    }
  },
  computeBoundsValues: function(variables) {
    var maxValue = 0, minValue = 0;
    variables.forEach(variable => {
      var targetValues = this.targetValues(variable),
        variableMaxValue = Math.max.apply(null, targetValues),
        variableMinValue = Math.min.apply(null, targetValues);
      if (variableMaxValue > maxValue) {
        maxValue = variableMaxValue;
      }
      if (variableMinValue > minValue) {
        minValue = variableMinValue;
      }
    });
    return [minValue, maxValue];
  },
  getDefaultProps: function() {
    return {
      aspectRatio: 4/3,
      defaultYAxisWidth: 200,
      labelsFontSize: 14,
      marginRight: 10,
      marginTop: 10,
      noColorFill: 'gray',
      xAxisHeight: 100,
      xNbSteps: 10,
      yNbSteps: 8,
    };
  },
  getInitialState: function() {
    return {
      yAxisWidth: null,
    };
  },
  gridPointToPixel: function(point) {
    var pixel = {
      x: axes.convertLinearRange(point.x, {
        newMax: this.gridWidth,
        newMin: 0,
        oldMax: this.props.xMaxValue,
        oldMin: this.props.xMinValue,
      }),
      y: axes.convertLinearRange(point.y, {
        newMax: 0, // newMax and newMin are inverted on Y axis in SVG
        newMin: this.gridHeight,
        oldMax: this.ySmartValues.maxValue,
        oldMin: this.ySmartValues.minValue,
      }),
    };
    return pixel;
  },
  handleVariableHover: function(event, variable) {
    this.props.onVariableHover(event.type === 'mouseover' ? variable : null);
  },
  render: function() {
    invariant(this.props.variables.every((variable) => variable.values.length > 1),
      'variables must have more than 1 value');
    var height = this.props.height || this.props.width / this.props.aspectRatio;
    var [yMinValue, yMaxValue] = this.computeBoundsValues(this.props.variables);
    // if (yMinValue === yMaxValue) {
    //   if (yMinValue > 0) {
    //     yMinValue = 0;
    //   } else if (yMaxValue < 0) {
    //     yMaxValue = 0;
    //   } else {
    //     yMinValue -= 1000;
    //     yMaxValue += 1000;
    //   }
    // }
    this.ySmartValues = axes.smartValues(0, yMaxValue, this.props.yNbSteps);
    var yAxisWidth = this.state.yAxisWidth === null ? this.props.defaultYAxisWidth : this.state.yAxisWidth;
    this.gridHeight = height - this.props.xAxisHeight - this.props.marginTop;
    this.gridWidth = this.props.width - yAxisWidth - this.props.marginRight;
    var minAxesMaxValues = Math.min(this.props.xMaxValue, this.ySmartValues.maxValue);
    var bisectrixPixels = [
      this.gridPointToPixel({x: this.props.xMinValue, y: this.props.xMinValue}),
      this.gridPointToPixel({x: minAxesMaxValues, y: minAxesMaxValues}),
    ];
    return (
      <svg height={height} width={this.props.width}>
        <g transform={`translate(${yAxisWidth}, ${height - this.props.xAxisHeight})`}>
          <HGrid
            height={this.gridHeight}
            nbSteps={this.props.yNbSteps}
            startStep={1}
            width={this.gridWidth}
          />
        </g>
        <g transform={`translate(${yAxisWidth}, ${this.props.marginTop})`}>
          <VGrid
            height={this.gridHeight}
            nbSteps={this.props.xNbSteps}
            startStep={1}
            width={this.gridWidth}
          />
        </g>
        <g transform={`translate(${yAxisWidth}, ${this.props.marginTop})`}>
          {
            this.props.variables.map((variable) => {
              var toDomainValue = (value) => axes.convertLinearRange(value, {
                newMax: this.props.xMaxValue,
                newMin: this.props.xMinValue,
                oldMax: variable.values.length - 1,
                oldMin: 0,
              });
              var basePoints = Lazy.range(0, variable.values.length).map(toDomainValue).zip(variable.baseValues)
                .toArray();
              var isFilled = variable.depth > 0;
              var targetPoints = Lazy.range(0, variable.values.length).map(toDomainValue)
                .zip(this.targetValues(variable)).toArray();
              var pointsSequence = isFilled ? Lazy(basePoints).concat(Lazy(targetPoints).reverse().toArray()) :
                Lazy(targetPoints);
              invariant(pointsSequence.every((pair) => ! isNaN(pair[0]) && ! isNaN(pair[1])), 'NaN is forbidden');
              var points = pointsSequence.map((pair) => ({x: pair[0], y: pair[1]})).toArray();
              var cssColor = variable.color ? `rgb(${variable.color})` : this.props.noColorFill;
              return (! variable.hasChildren || variable.isCollapsed || variable.depth === 0) && (
                <Curve
                  className={variable.code}
                  fill={isFilled}
                  key={variable.code}
                  onHover={event => this.handleVariableHover(event, variable)}
                  points={points}
                  pointToPixel={this.gridPointToPixel}
                  style={{
                    fill: isFilled ? cssColor : 'none',
                    stroke: cssColor,
                  }}
                />
              );
            })
          }
          {
            this.props.displayBisectrix && (
              <line
                className='bisectrix'
                x1={bisectrixPixels[0].x}
                y1={bisectrixPixels[0].y}
                x2={bisectrixPixels[1].x}
                y2={bisectrixPixels[1].y}
                style={{
                  fill: 'none',
                  stroke: 'black',
                  strokeDasharray: '5 5',
                  strokeWidth: 1,
                }}
              />
            )
          }
          <YAxis
            formatNumber={this.props.formatNumber}
            height={this.gridHeight}
            maxValue={this.ySmartValues.maxValue}
            minValue={this.ySmartValues.minValue}
            nbSteps={this.props.yNbSteps}
            ref='yAxis'
            unit='€'
          />
        </g>
        <g transform={`translate(${yAxisWidth},${height - this.props.xAxisHeight})`}>
          <XAxis
            formatNumber={this.props.formatNumber}
            height={this.props.xAxisHeight}
            label={this.props.xAxisLabel}
            labelFontSize={this.props.labelsFontSize}
            maxValue={this.props.xMaxValue}
            minValue={this.props.xMinValue}
            nbSteps={this.props.xNbSteps}
            rotateLabels={true}
            unit='€'
            width={this.gridWidth}
          />
        </g>
        {
          this.props.attribution && (
            <g className='attribution' transform={`translate(${yAxisWidth}, ${height - 10})`}>
              <text>{this.props.attribution}</text>
            </g>
          )
        }
      </svg>
    );
  },
  targetValues: function(variable) {
    return Lazy(variable.baseValues).zip(variable.values).map(pair => Lazy(pair).sum()).toArray();
  },
});

module.exports = BaremeChart;
