/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  strformat = require('strformat');


var XAxisLabelled = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    labels: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    labelsFontSize: React.PropTypes.number.isRequired,
    style: React.PropTypes.object,
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
    var toRadians = function(angle) { return angle * (Math.PI / 180); };
    var lineStyle = Lazy(this.props.style).defaults(this.props.defaultStyle).toObject();
    var stepWidth = this.props.width / this.props.labels.length;
    return (
      <g className='axis x-axis x-axis-labelled'>
        <line style={lineStyle} x2={this.props.width} y2={0} />
        {
          this.props.labels.map((label, stepIdx) =>
            <g
              key={'tick-' + stepIdx}
              transform={strformat('translate({0}, 0)', stepIdx * stepWidth)}>
              <line style={lineStyle} x2={0} y2={this.props.tickSize} />
            </g>
          )
        }
        {
          this.props.labels.map((label, stepIdx) => {
            var defaultStyle = {
              fontSize: this.props.labelsFontSize,
              textAnchor: 'end',
              textRendering: 'optimizeLegibility',
            };
            var style = Lazy(label.style).defaults(defaultStyle).toObject();
            return (
              <g
                key={'label-' + stepIdx}
                transform={strformat('translate({0}, 0)', (stepIdx + 0.5) * stepWidth)}>
                {
                  React.addons.cloneWithProps((
                    <text
                      style={style}
                      textLength={this.props.height / Math.cos(toRadians(45)) - this.props.tickSize}
                      transform='rotate(-45)'
                      x={0}
                      y={this.props.labelsFontSize + this.props.tickSize}>
                      {label.name}
                    </text>
                  ), label.props)
                }
              </g>
            );
          })
        }
      </g>
    );
  }
});

module.exports = XAxisLabelled;
