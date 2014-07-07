/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var XAxisLabelled = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    labels: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    nbSteps: React.PropTypes.number.isRequired,
    style: React.PropTypes.object,
    labelsFontSize: React.PropTypes.number.isRequired,
    tickSize: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      defaultStyle: {
        shapeRendering: 'crispedges',
        stroke: 'black',
      },
      labelsFontSize: 14,
      tickSize: 6,
    };
  },
  render: function() {
    var lineStyle = Lazy(this.props.style).defaults(this.props.defaultStyle).toObject();
    var stepWidth = this.props.width / this.props.nbSteps;
    return (
      <g className="axis x-axis x-axis-labelled">
        <line style={lineStyle} x2={this.props.width} y2={0} />
        {
          Lazy.range(this.props.nbSteps).toArray().map(function(stepIdx) {
            var translateX = stepIdx * stepWidth;
            return (
              <g key={'tick-' + stepIdx} transform={'translate(' + translateX + ', 0)'}>
                <line style={lineStyle} x2={0} y2={this.props.tickSize} />
              </g>
            );
          }, this)
        }
        {
          Lazy.range(this.props.nbSteps).toArray().map(function(stepIdx) {
            var translateX = (stepIdx + 0.5) * stepWidth;
            return (
              <g key={'label-' + stepIdx} transform={'translate(' + translateX + ', 0)'}>
                <text
                  style={{
                    fontSize: this.props.labelsFontSize,
                    textAnchor: 'end',
                    textRendering: 'geometricPrecision',
                  }}
                  transform='rotate(-45)'
                  x={0}
                  y={this.props.labelsFontSize + this.props.tickSize}>
                  {this.props.labels[stepIdx]}
                </text>
              </g>
            );
          }, this)
        }
      </g>
    );
  }
});

module.exports = XAxisLabelled;
