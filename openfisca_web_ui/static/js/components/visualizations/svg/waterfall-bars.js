/** @jsx React.DOM */
'use strict';

var React = require('react');


var WaterfallBars = React.createClass({
  propTypes: {
    activeVariableCode: React.PropTypes.string,
    height: React.PropTypes.number.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    rectOpacity: React.PropTypes.number.isRequired,
    strokeActive: React.PropTypes.string.isRequired,
    strokeInactive: React.PropTypes.string.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    minValue: React.PropTypes.number.isRequired,
    variables: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      noColorFill: 'gray',
      rectOpacity: 0.8,
      strokeActive: 'black',
      strokeInactive: 'gray',
    };
  },
  render: function() {
    var unitHeight = this.props.height / (this.props.maxValue - this.props.minValue);
    var y0 = this.props.maxValue > 0 ? this.props.maxValue * unitHeight : 0;
    var stepWidth = this.props.width / this.props.variables.length;
    return (
      <g>
        {
          this.props.variables.map(function(variable, variableIndex) {
            var isSubtotal = ! variable.collapsed && variable.hasChildren;
            var style = {
              fill: variable.color ? 'rgb(' + variable.color.join(',') + ')' : this.props.noColorFill,
              opacity: variable.code === this.props.activeVariableCode ? 1 : this.props.rectOpacity,
              shapeRendering: 'crispedges',
              stroke: variable.code === this.props.activeVariableCode ?
                this.props.strokeActive : this.props.strokeInactive,
              strokeWidth: isSubtotal && 3,
            };
            var height = Math.abs(variable.value) * unitHeight;
            var y = y0 - Math.max(variable.baseValue, variable.baseValue + variable.value) * unitHeight;
            return (
              isSubtotal ? (
                <line
                  key={variable.code}
                  style={style}
                  x1={(variableIndex + 0.5) * stepWidth}
                  y1={y}
                  x2={(variableIndex + 0.5) * stepWidth}
                  y2={height + y}
                />
              ) : (
                <rect
                  height={height}
                  key={variable.code}
                  style={style}
                  width={stepWidth * 0.8}
                  x={(variableIndex + 0.1) * stepWidth}
                  y={y}
                />
              )
            );
          }, this)
        }
      </g>
    );
  }
});

module.exports = WaterfallBars;
