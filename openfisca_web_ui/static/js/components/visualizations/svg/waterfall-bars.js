/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var WaterfallBars = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    highlightedVariableCode: React.PropTypes.string,
    noColorFill: React.PropTypes.string.isRequired,
    rectOpacity: React.PropTypes.number.isRequired,
    strokeActive: React.PropTypes.string.isRequired,
    strokeInactive: React.PropTypes.string.isRequired,
    valueMax: React.PropTypes.number.isRequired,
    valueMin: React.PropTypes.number.isRequired,
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
    var unitHeight = this.props.height / (this.props.valueMax - this.props.valueMin);
    var y0 = this.props.valueMax > 0 ? this.props.valueMax * unitHeight : 0;
    var variables = this.props.variables.map(function(variable) {
      return Lazy(variable).assign({
        height: Math.abs(variable.value) * unitHeight,
        y: y0 - Math.max(variable.baseValue, variable.baseValue + variable.value) * unitHeight,
      }).toObject();
    }.bind(this));
    var tickWidth = this.props.width / variables.length;
    return (
      <g>
        {
          variables.map(function(variable, variableIndex) {
            var isSubtotal = ! variable.collapsed && variable.hasChildren;
            var style = {
              fill: variable.color ? 'rgb(' + variable.color.join(',') + ')' : this.props.noColorFill,
              opacity: variable.code === this.props.highlightedVariableCode ? 1 : this.props.rectOpacity,
              shapeRendering: 'crispedges',
              stroke: variable.code === this.props.highlightedVariableCode ?
                this.props.strokeActive : this.props.strokeInactive,
              strokeWidth: isSubtotal && 3,
            };
            return (
              isSubtotal ? (
                <line
                  key={variable.code}
                  style={style}
                  x1={(variableIndex + 0.5) * tickWidth}
                  y1={variable.y}
                  x2={(variableIndex + 0.5) * tickWidth}
                  y2={variable.height + variable.y}
                />
              ) : (
                <rect
                  height={variable.height}
                  key={variable.code}
                  style={style}
                  width={tickWidth * 0.8}
                  x={(variableIndex + 0.1) * tickWidth}
                  y={variable.y}
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
