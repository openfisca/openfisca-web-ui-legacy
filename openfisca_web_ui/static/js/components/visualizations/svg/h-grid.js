/** @jsx React.DOM */
'use strict';

var range = require('lodash.range'),
  React = require('react');


var HGrid = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    startStep: React.PropTypes.number.isRequired,
    steps: React.PropTypes.number.isRequired,
    strokeColor: React.PropTypes.string.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      startStep: 0,
      steps: 10,
      strokeColor: '#e5e5e5',
    };
  },
  render: function() {
    var stepSize = this.props.maxValue / this.props.steps;
    var stepSizePx = this.valueToPixel(stepSize);
    var steps = range(this.props.startStep, this.props.steps + 1);
    var lineStyle = {stroke: this.props.strokeColor, shapeRendering: 'crispedges'};
    return (
      <g className="grid y-grid">
        {
          steps.map(function(step) {
            var translateY = this.props.height - step * stepSizePx;
            return (
              <g key={'line-' + step} transform={'translate(0, ' + translateY + ')'}>
                <line style={lineStyle} x2={this.props.width} />
              </g>
            );
          }, this)
        }
      </g>
    );
  },
  valueToPixel: function(value) {
    return (value / this.props.maxValue) * this.props.height;
  },
});

module.exports = HGrid;
