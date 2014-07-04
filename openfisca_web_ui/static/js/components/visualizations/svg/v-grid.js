/** @jsx React.DOM */
'use strict';

var range = require('lodash.range'),
  React = require('react');


var VGrid = React.createClass({
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
      <g className="grid x-grid">
        {
          steps.map(function(step) {
            var translateX = step * stepSizePx;
            return (
              <g key={'line-' + step} transform={'translate(' + translateX + ', 0)'}>
                <line style={lineStyle} y2={- this.props.height} />
              </g>
            );
          }, this)
        }
      </g>
    );
  },
  valueToPixel: function(value) {
    return (value / this.props.maxValue) * this.props.width;
  },
});

module.exports = VGrid;
