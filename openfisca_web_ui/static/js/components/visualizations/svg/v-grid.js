/** @jsx React.DOM */
'use strict';

var range = require('lodash.range'),
  React = require('react/addons');


var VGrid = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    startStep: React.PropTypes.number.isRequired,
    steps: React.PropTypes.number.isRequired,
    style: React.PropTypes.object,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      defaultStyle: {
        shapeRendering: 'crispedges',
        stroke: '#e5e5e5',
      },
      startStep: 0,
      steps: 10,
    };
  },
  render: function() {
    var stepSize = this.props.maxValue / this.props.steps;
    var stepSizePx = this.valueToPixel(stepSize);
    var steps = range(this.props.startStep, this.props.steps + 1);
    var style = this.props.style ?
      React.addons.update(this.props.defaultStyle, {$merge: this.props.style}) :
      this.props.defaultStyle;
    return (
      <g className="grid v-grid">
        {
          steps.map(function(step) {
            var translateX = step * stepSizePx;
            return (
              <g key={'line-' + step} transform={'translate(' + translateX + ', 0)'}>
                <line style={style} y2={- this.props.height} />
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
