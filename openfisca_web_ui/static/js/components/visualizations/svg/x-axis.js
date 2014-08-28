/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var XAxis = React.createClass({
  propTypes: {
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    label: React.PropTypes.string,
    labelFontSize: React.PropTypes.number.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    minValue: React.PropTypes.number.isRequired,
    nbSteps: React.PropTypes.number.isRequired,
    rotateLabels: React.PropTypes.bool,
    strokeColor: React.PropTypes.string.isRequired,
    tickFontSize: React.PropTypes.number.isRequired,
    tickSize: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      labelFontSize: 14,
      minValue: 0,
      nbSteps: 10,
      strokeColor: 'black',
      tickFontSize: 12,
      tickSize: 6,
    };
  },
  render: function() {
    var stepRange = (this.props.maxValue - this.props.minValue) / this.props.nbSteps;
    var stepWidth = this.valueToPixel(stepRange);
    var steps = Lazy.range(this.props.minValue, this.props.maxValue + stepRange, stepRange).toArray();
    var lineStyle = {stroke: this.props.strokeColor, shapeRendering: 'crispedges'};
    return (
      <g className="axis x-axis">
        <line style={lineStyle} x2={this.props.width} y2={0} />
        {
          steps.map((value, idx) => {
            var translateY = this.props.tickSize + this.props.tickFontSize * (this.props.rotateLabels ? 1 : 1.5);
            var labelTransform = `translate(0, ${translateY})`;
            if (this.props.rotateLabels) {
              labelTransform += ' rotate(-45)';
            }
            var formattedValue = this.props.formatNumber(value),
              unit = this.props.unit;
            var label = unit && value !== 0 ? `${formattedValue} ${unit}` : formattedValue;
            return (
              <g key={idx} transform={`translate(${idx * stepWidth}, 0)`}>
                <g transform={labelTransform}>
                  <text
                    style={{
                      fontSize: this.props.tickFontSize,
                      textAnchor: idx === steps.length - 1 || this.props.rotateLabels ? 'end' : 'middle',
                    }}>
                    {label}
                  </text>
                </g>
                <line style={lineStyle} x2={0} y2={this.props.tickSize} />
              </g>
            );
          })
        }
        {
          this.props.label && (
            <text
              className='axis-label'
              style={{fontSize: this.props.labelFontSize, textAnchor: 'middle'}}
              x={this.props.width / 2}
              y={this.props.height - this.props.labelFontSize}>
              {this.props.label}
            </text>
          )
        }
      </g>
    );
  },
  valueToPixel: function(value) {
    return (value / (this.props.maxValue - this.props.minValue)) * this.props.width;
  },
});

module.exports = XAxis;
