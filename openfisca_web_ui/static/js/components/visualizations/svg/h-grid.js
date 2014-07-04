/** @jsx React.DOM */
'use strict';

var range = require('lodash.range'),
  React = require('react/addons');


var HGrid = React.createClass({
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
        stroke: '#e5e5e5',
        shapeRendering: 'crispedges',
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
      <g className="grid h-grid">
        {
          steps.map(function(step) {
            var translateY = this.props.height - step * stepSizePx;
            return (
              <g key={'line-' + step} transform={'translate(0, ' + translateY + ')'}>
                <line style={style} x2={this.props.width} />
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
