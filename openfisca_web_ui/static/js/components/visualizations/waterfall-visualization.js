/** @jsx React.DOM */
'use strict';

var React = require('react');


var valueIndex = 0;

function calculateStepSize(range, stepsCount) {
  // cf http://stackoverflow.com/questions/361681/algorithm-for-nice-grid-line-intervals-on-a-graph
  // Calculate an initial guess at step size.
  var ln10 = Math.log(10);
  var tempStepSize = range / stepsCount;
  // Get the magnitude of the step size.
  var mag = Math.floor(Math.log(tempStepSize) / ln10);
  var magPow = Math.pow(10, mag);
  // Calculate most significant digit of the new step size.
  var magMsd = Math.round(tempStepSize / magPow + 0.5);
  // Promote the MSD to either 2, 5 or 10.
  if (magMsd > 5.0) {
    magMsd = 10.0;
  } else if (magMsd > 2.0) {
    magMsd = 5.0;
  } else if (magMsd > 1.0) {
    magMsd = 2.0;
  }
  return magMsd * magPow;
}

function extractVariablesFromTree(variableByCode, variableOpenedByCode, node, baseValue, depth, hidden) {
  var children = node.children;
  var opened = variableOpenedByCode[node.code] || depth === 0;
  if (children) {
    var childBaseValue = baseValue;
    for (var childIndex = 0; childIndex < children.length; childIndex++) {
      var child = children[childIndex];
      extractVariablesFromTree(variableByCode, variableOpenedByCode, child, childBaseValue, depth + 1,
        hidden || ! opened);
      childBaseValue += child.values[valueIndex];
    }
  }
  var value = node.values[valueIndex];
  node.baseValue = baseValue;
  node.depth = depth;
  node.value = value;
  if (! hidden && value !== 0) {
    node.type = opened && children ? 'bar' : 'var';
    variableByCode[node.code] = node;
  }
}

var WaterfallVisualization = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    variablesTree: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  computeBarsData: function (variableOpenedByCode, variablesTree) {
    var variableByCode = {};
    extractVariablesFromTree(variableByCode, variableOpenedByCode, variablesTree, 0, 0);
    var valueMax = 0;
    var valueMin = 0;
    var value, variable;
    for (var code in variableByCode) {
      variable = variableByCode[code];
      value = variable.baseValue + variable.value;
      if (value > valueMax) {
        valueMax = value;
      } else if (value < valueMin) {
        valueMin = value;
      }
    }
    var tickValue = calculateStepSize(valueMax - valueMin, 8);
    valueMax = Math.round(valueMax / tickValue + 0.5) * tickValue;
    valueMin = Math.round(valueMin / tickValue - 0.5) * tickValue;
    var unitHeight = this.gridHeight() / (valueMax - valueMin);
    var bars = [];
    var y0 = this.props.marginTop + (valueMax > 0 ? unitHeight * valueMax : 0);
    for (code in variableByCode) {
      variable = variableByCode[code];
      bars.push({
        baseValue: variable.baseValue,
        code: variable.code,
        hasChildren: variable.children ? true : false,
        height: Math.abs(variable.value) * unitHeight,
        name: variable.name,
        type: variable.type,
        value: variable.value,
        y: y0 - Math.max(variable.baseValue, variable.baseValue + variable.value) * unitHeight
      });
    }
    var yAxisLabels = [];
    for (value = valueMin; value <= valueMax; value += tickValue) {
      yAxisLabels.push(value.toString());
    }
    return {
      bars: bars,
      tickHeight: tickValue * unitHeight,
      tickWidth: this.state.gridWidth / bars.length,
      y0: y0,
      yAxisLabels: yAxisLabels,
    };
  },
  getDefaultProps: function() {
    return {
      blueFillColor: '#80B1D3',
      blueStrokeColor: '#6B94B0',
      greenFillColor: '#B3DE69',
      greenStrokeColor: '#95B957',
      height: 398,
      marginBottom: 160,
      marginLeft: 100,
      marginRight: 0,
      marginTop: 10,
      redFillColor: '#FB8072',
      redStrokeColor: '#D26B5F',
      // The flags indicating whether a variable (with children) is closed or open (default).
      // This is stored in a separate dictionnary, to ensure that the flag will not be lost each time the variables
      // are updated by OpenFisca API.
      variableOpenedByCode: {},
      width: 598,
    };
  },
  gridHeight: function() {
    return this.props.height - this.props.marginTop - this.props.marginBottom;
  },
  gridWidth: function() {
    return this.props.width - this.props.marginLeft - this.props.marginRight;
  },
  onToggleVariable: function (type) {
    var variableOrBar = this.state[type];
    this.toggle('variableOpenedByCode.' + variableOrBar.code);
  },
  render: function() {
    var barsData = this.computeBarsData();
    return (
      <svg
        height="400"
        preserveAspectRatio="xMinYMin"
        viewBox={'0 0 ' + this.props.width + ' ' + this.props.height}
        width="100%">
        {/* Y-axis */}
        <g transform={'translate(' + this.props.marginLeft + ', 0)'}>
          <path
            d={'M-6,' + this.props.marginTop + 'H0V' + this.props.height - this.props.marginBottom + 'H-6'}
            style={{fill: 'none', stroke: 'black', shapeRendering: 'crispedges'}}
          />
          {
            barsData.yAxisLabels.map(function(yAxisLabel, yAxisIndex) {
              var translateY = this.props.height - this.props.marginBottom - yAxisIndex * barsData.tickHeight;
              return (
                <g
                  style={{opacity: 1}}
                  transform={'translate(0, ' + translateY + ')'}>
                  <text
                    style={{textAnchor: 'end', fontFamily: 'sans-serif', fontSize: 12}}
                    dy=".32em"
                    x="-9"
                    y="0">
                    {yAxisLabel}
                  </text>
                  <line
                    style={{fill: 'none', stroke: 'black', shapeRendering: 'crispedges'}}
                    x2="-6"
                    y2="0"
                  />
                  <line
                    style={{fill: 'none', stroke: 'lightgray', opacity: 0.8}}
                    x2={this.props.width - this.props.marginLeft - this.props.marginRight}
                    y2="0"
                  />
                </g>
              );
            })
          }
        </g>
        {/* X-axis labels */}
        <g transform={'translate(0, ' + (this.props.marginTop + this.gridHeight() + 5) + ')'}>
          {
            barsData.bars.map(function(bar, barIndex) {
              var translateX = this.props.marginLeft + barIndex * barsData.tickWidth + barsData.tickWidth / 2;
              return (
                <g
                  style={{opacity: 1}}
                  transform={'translate(' + translateX + ', 0)'}>
                  <text
                    dy=".71em"
                    style={{textAnchor: 'end', fontFamily: 'sans-serif', fontSize: '12px'}}
                    transform="rotate(-45)">
                    {bar.name}
                  </text>
                </g>
              );
            })
          }
        </g>

        {/* X-axis */}
        <g transform={'translate(0, ' + barsData.y0 + ')'}>
          <path
            d={'M' + this.props.marginLeft + ',6V0H' + this.props.width - this.props.marginRight + 'V6'}
            style={{fill: 'none', stroke: 'black', shapeRendering: 'crispedges'}}
          />
          {
            barsData.bars.map(function(bar, barIndex) {
              var translateX = this.props.marginLeft + barIndex * this.props.tickWidth;
              return (
                <g
                  style="opacity: 1;"
                  transform={'translate(' + translateX +  ', 0)'}>
                  <line
                    style={{fill: 'none', stroke: 'black', shapeRendering: 'crispedges'}}
                    x2="0"
                    y2="6"
                  />
                </g>
              );
            })
          }
        </g>

        {/* Vertical bars */}
        {
          barsData.bars.map(function(bar, barIndex) {
            if (bar.type === 'bar') {
              return (
                <rect
                  fill={this.props.blueFillColor}
                  height={bar.height}
                  onClick={bar.hasChildren && this.onToggleVariable}
                  opacity="0.8"
                  stroke={this.props.blueStrokeColor}
                  width={this.props.tickWidth * 0.8}
                  x={this.props.marginLeft + barIndex * this.props.tickWidth + 0.1 * this.props.tickWidth}
                  y={bar.y}
                />
              );
            } else if (bar.type === 'bar') {
              return (
                <rect
                  fill={bar.value > 0 ? this.props.greenFillColor : this.props.redFillColor}
                  height={this.props.height}
                  onClick={bar.hasChildren && this.onToggleVariable}
                  opacity="0.8"
                  stroke={bar.value > 0 ? this.props.greenStrokeColor : this.props.redStrokeColor}
                  width={this.props.tickWidth * 0.8}
                  x={this.props.marginLeft + barIndex * this.props.tickWidth + 0.1 * this.props.tickWidth}
                  y={bar.y}
                />
              );
            }
          })
        }
      </svg>
    );
  }
});

module.exports = WaterfallVisualization;
