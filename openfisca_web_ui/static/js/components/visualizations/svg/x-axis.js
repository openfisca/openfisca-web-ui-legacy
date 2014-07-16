/** @jsx React.DOM */
'use strict';

var range = require('lodash.range'),
  React = require('react');


var XAxis = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    label: React.PropTypes.string,
    labelFontSize: React.PropTypes.number.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    steps: React.PropTypes.number.isRequired,
    strokeColor: React.PropTypes.string.isRequired,
    tickFontSize: React.PropTypes.number.isRequired,
    tickSize: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      labelFontSize: 14,
      steps: 10,
      strokeColor: 'black',
      tickFontSize: 12,
      tickSize: 6,
    };
  },
  render: function() {
    var stepSize = this.props.maxValue / this.props.steps;
    var stepSizePx = this.valueToPixel(stepSize);
    var steps = range(0, this.props.maxValue + stepSize, stepSize);
    var lineStyle = {stroke: this.props.strokeColor, shapeRendering: 'crispedges'};
    return (
      <g className="axis x-axis">
        <line style={lineStyle} x2={this.props.width} y2={0} />
        {
          steps.map(function(value, idx) {
            var translateX = idx * stepSizePx;
            return (
              <g key={'tick-' + idx} transform={'translate(' + translateX + ', 0)'}>
                <text
                  style={{textAnchor: 'middle', fontSize: this.props.tickFontSize}}
                  x={0}
                  y={this.props.tickSize + this.props.tickFontSize * 1.4}>
                  {value}
                </text>
                <line style={lineStyle} x2={0} y2={this.props.tickSize} />
              </g>
            );
          }, this)
        }
        {
          this.props.label && (
            <text
              className='axis-label'
              style={{textAnchor: 'middle', fontSize: this.props.labelFontSize}}
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
    return (value / this.props.maxValue) * this.props.width;
  },
});

module.exports = XAxis;
