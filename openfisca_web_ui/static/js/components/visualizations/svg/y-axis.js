/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react');


var YAxis = React.createClass({
  propTypes: {
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    minValue: React.PropTypes.number.isRequired,
    nbSteps: React.PropTypes.number.isRequired,
    strokeColor: React.PropTypes.string.isRequired,
    tickLabelsFontSize: React.PropTypes.number.isRequired,
    tickSize: React.PropTypes.number.isRequired,
    unit: React.PropTypes.string,
  },
  getDefaultProps() {
    return {
      labelFontSize: 14,
      minValue: 0,
      nbSteps: 10,
      strokeColor: 'black',
      tickLabelsFontSize: 12,
      tickSize: 6,
    };
  },
  render() {
    var range = this.props.maxValue - this.props.minValue;
    invariant(range > 0, 'range must be positive');
    var stepRange = range / this.props.nbSteps;
    var stepHeight = this.valueToPixel(stepRange);
    var steps = Lazy.range(this.props.minValue, this.props.maxValue + stepRange, stepRange).toArray();
    var lineStyle = {stroke: this.props.strokeColor, shapeRendering: 'crispedges'};
    return (
      <g className="axis y-axis">
        <line style={lineStyle} x2={0} y2={this.props.height} />
        {
          steps.map((value, idx) => {
            var formattedValue = this.props.formatNumber(value),
              unit = this.props.unit;
            var label = unit && value !== 0 ? `${formattedValue} ${unit}` : formattedValue;
            return (
              <g key={idx} transform={`translate(0, ${this.props.height - idx * stepHeight})`}>
                <text
                  className='tick-label'
                  style={{textAnchor: 'end', fontSize: this.props.tickLabelsFontSize}}
                  x={- this.props.tickSize * 1.66}
                  y={this.props.tickLabelsFontSize * 0.4}>
                  {label}
                </text>
                <line style={lineStyle} x2={- this.props.tickSize} y2={0} />
              </g>
            );
          })
        }
      </g>
    );
  },
  valueToPixel(value) {
    return (value / (this.props.maxValue - this.props.minValue)) * this.props.height;
  },
});

module.exports = YAxis;
