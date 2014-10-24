/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
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
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number,
    labelsFontSize: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onVariableHover: React.PropTypes.func,
    onVariableToggle: React.PropTypes.func,
    variables: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    xMaxValue: React.PropTypes.number.isRequired,
    xMinValue: React.PropTypes.number.isRequired,
    xNbSteps: React.PropTypes.number.isRequired,
    yAxisWidth: React.PropTypes.number.isRequired,
    yNbSteps: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      aspectRatio: 4/3,
      labelsFontSize: 14,
      marginRight: 10,
      marginTop: 10,
      noColorFill: 'gray',
      xAxisHeight: 100,
      yAxisWidth: 80,
      xNbSteps: 10,
      yNbSteps: 8,
    };
  },
  gridPointToPixel: function(point) {
    var pixel = {
      x: axes.convertLinearRange({
        newMax: this.gridWidth,
        newMin: 0,
        oldMax: this.props.xMaxValue,
        oldMin: this.props.xMinValue,
      }, point.x),
      y: axes.convertLinearRange({
        newMax: 0,
        newMin: this.gridHeight,
        oldMax: this.ySmartValues.maxValue,
        oldMin: this.ySmartValues.minValue,
      }, point.y),
    };
    return pixel;
  },
  handleVariableHover: function(variable, event) {
    this.props.onVariableHover(event.type === 'mouseover' ? variable : null);
  },
  render: function() {
    var height = this.props.height || this.props.width / this.props.aspectRatio;
    if (this.props.variables.length) {
      var revdisp = this.props.variables.find(_ => _.code === 'revdisp');
      var yMaxValue = Math.max.apply(null, revdisp.values),
        yMinValue = Math.min.apply(null, revdisp.values);
      this.ySmartValues = axes.smartValues(yMinValue, yMaxValue, this.props.yNbSteps);
      var clipValues = value => Math.max(value, this.ySmartValues.minValue);
      var targetValues = variable => Lazy(variable.baseValues).zip(variable.values).map(pair => Lazy(pair).sum())
        .toArray();
    }
    this.gridHeight = height - this.props.xAxisHeight - this.props.marginTop;
    this.gridWidth = this.props.width - this.props.yAxisWidth - this.props.marginRight;
    return (
      <svg height={height} width={this.props.width}>
        <g transform={`translate(${this.props.yAxisWidth}, ${height - this.props.xAxisHeight})`}>
          <HGrid
            height={this.gridHeight}
            nbSteps={this.props.yNbSteps}
            startStep={1}
            width={this.gridWidth}
          />
        </g>
        <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
          <VGrid
            height={this.gridHeight}
            nbSteps={this.props.xNbSteps}
            startStep={1}
            width={this.gridWidth}
          />
        </g>
        <g transform={'translate(' + this.props.yAxisWidth + ', ' + this.props.marginTop + ')'}>
          {
            this.props.variables.map(variable => {
              var toDomainValue = axes.convertLinearRange.bind(null, {
                newMax: this.props.xMaxValue,
                newMin: this.props.xMinValue,
                oldMax: variable.values.length - 1,
                oldMin: 0,
              });
              var basePoints = Lazy.range(0, variable.values.length).map(toDomainValue)
                .zip(variable.baseValues.map(clipValues)).toArray();
              var isFilled = variable.depth > 0;
              var targetPoints = Lazy.range(0, variable.values.length).map(toDomainValue)
                .zip(targetValues(variable).map(clipValues)).toArray();
              var pointsSequence = isFilled ? Lazy(basePoints).concat(Lazy(targetPoints).reverse().toArray()) :
                Lazy(targetPoints);
              var points = pointsSequence.map(pair => ({x: pair[0], y: pair[1]})).toArray(); // jshint ignore:line
              var cssColor = variable.color ? `rgb(${variable.color})` : this.props.noColorFill;
              return (! variable.hasChildren || variable.isCollapsed || variable.depth === 0) && (
                <Curve
                  active={this.props.activeVariableCode === variable.code}
                  fill={isFilled}
                  key={variable.code}
                  onHover={this.props.onVariableHover ? this.handleVariableHover.bind(null, variable) : null}
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
          <YAxis
            formatNumber={this.props.formatNumber}
            height={this.gridHeight}
            labelFontSize={this.props.labelsFontSize}
            maxValue={this.ySmartValues.maxValue}
            minValue={this.ySmartValues.minValue}
            nbSteps={this.props.yNbSteps}
            unit='€'
            width={this.props.yAxisWidth}
          />
        </g>
        <g transform={
          'translate(' + this.props.yAxisWidth + ', ' + (height - this.props.xAxisHeight) + ')'
        }>
          <XAxis
            formatNumber={this.props.formatNumber}
            height={this.props.xAxisHeight}
            label="Revenus d'activité imposables"
            labelFontSize={this.props.labelsFontSize}
            maxValue={this.props.xMaxValue}
            minValue={this.props.xMinValue}
            nbSteps={this.props.xNbSteps}
            rotateLabels={true}
            unit='€'
            width={this.gridWidth}
          />
        </g>
        <g className='attribution' transform={`translate(${this.props.yAxisWidth}, ${height - 10})`}>
          <text>{this.props.attribution}</text>
        </g>
      </svg>
    );
  },
});

module.exports = BaremeChart;
