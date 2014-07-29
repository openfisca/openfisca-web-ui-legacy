/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var VGrid = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    nbSteps: React.PropTypes.number.isRequired,
    startStep: React.PropTypes.number.isRequired,
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
    };
  },
  render: function() {
    var style = Lazy(this.props.style).defaults(this.props.defaultStyle).toObject();
    var stepWidth = this.props.width / this.props.nbSteps;
    var steps = Lazy.range(this.props.startStep, this.props.nbSteps + this.props.startStep).toArray();
    return (
      <g className="grid v-grid">
        {
          steps.map(function(stepNum, idx) {
            var translateX = stepNum * stepWidth;
            return (
              <g key={'line-' + idx} transform={'translate(' + translateX + ', 0)'}>
                <line style={style} y2={this.props.height} />
              </g>
            );
          }.bind(this))
        }
      </g>
    );
  },
});

module.exports = VGrid;
