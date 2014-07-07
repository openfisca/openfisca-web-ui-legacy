/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react');


var WaterfallBars = React.createClass({
  propTypes: {
    blueFillColor: React.PropTypes.string.isRequired,
    blueStrokeColor: React.PropTypes.string.isRequired,
    greenFillColor: React.PropTypes.string.isRequired,
    greenStrokeColor: React.PropTypes.string.isRequired,
    height: React.PropTypes.number.isRequired,
    onBarClick: React.PropTypes.func.isRequired,
    rectOpacity: React.PropTypes.number.isRequired,
    redFillColor: React.PropTypes.string.isRequired,
    redStrokeColor: React.PropTypes.string.isRequired,
    valueMax: React.PropTypes.number.isRequired,
    valueMin: React.PropTypes.number.isRequired,
    variablesByCode: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  componentWillMount: function() {
    this.unitHeight = this.props.height / (this.props.valueMax - this.props.valueMin);
  },
  computeBarsData: function() {
    var y0 = this.props.valueMax > 0 ? this.props.valueMax * this.unitHeight : 0;
    var bars = Lazy(this.props.variablesByCode).map(function(variable) {
      return {
        baseValue: variable.baseValue,
        code: variable.code,
        hasChildren: variable.children ? true : false,
        height: Math.abs(variable.value) * this.unitHeight,
        name: variable.name,
        type: variable.type,
        value: variable.value,
        y: y0 - Math.max(variable.baseValue, variable.baseValue + variable.value) * this.unitHeight,
      };
    }.bind(this)).toArray();
    return {bars: bars};
//    var yAxisLabels = [];
//    for (var value = valueMin; value <= valueMax; value += tickValue) {
//      yAxisLabels.push(value.toString());
//    }
//    return {
//      bars: bars,
//      tickHeight: tickValue * this.unitHeight,
//      tickWidth: this.gridWidth / bars.length,
//      y0: y0,
//      yAxisLabels: yAxisLabels,
//    };
  },
  getDefaultProps: function() {
    return {
      blueFillColor: '#80B1D3',
      blueStrokeColor: '#6B94B0',
      greenFillColor: '#B3DE69',
      greenStrokeColor: '#95B957',
      rectOpacity: 0.8,
      redFillColor: '#FB8072',
      redStrokeColor: '#D26B5F',
    };
  },
  render: function() {
    var barsData = this.computeBarsData();
    var barWidth = this.props.width / barsData.bars.length;
    return (
      <g>
        {
          barsData.bars.map(function(bar, barIndex) {
            invariant(bar.type === 'bar' || bar.type === 'var', 'bar.type is neither "bar" nor "var": %s', bar.type);
            var fillColor = bar.type === 'bar' ? this.props.blueFillColor :
              bar.value > 0 ? this.props.greenFillColor : this.props.redFillColor;
            var stroke = bar.type === 'bar' ? this.props.blueStrokeColor :
              bar.value > 0 ? this.props.greenStrokeColor : this.props.redStrokeColor;
            return (
              <rect
                fill={fillColor}
                height={bar.height}
                key={'bar-' + barIndex}
                onClick={bar.hasChildren && this.props.onBarClick.bind(null, bar)}
                opacity={this.props.rectOpacity}
                stroke={stroke}
                width={barWidth * 0.8}
                x={barIndex * barWidth + 0.1 * barWidth}
                y={bar.y}
              />
            );
          }, this)
        }
      </g>
    );
  }
});

module.exports = WaterfallBars;
