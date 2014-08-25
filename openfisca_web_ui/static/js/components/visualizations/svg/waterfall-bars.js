/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var WaterfallBars = React.createClass({
  propTypes: {
    activeVariableCode: React.PropTypes.string,
    height: React.PropTypes.number.isRequired,
    highlightColor: React.PropTypes.string.isRequired,
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
      highlightColor: '#eee',
      noColorFill: 'gray',
      rectOpacity: 0.8,
      strokeActive: 'black',
      strokeInactive: 'gray',
    };
  },
  render: function() {
    var unitHeight = this.props.height / (this.props.maxValue - this.props.minValue);
    var y0 = this.props.maxValue > 0 ? this.props.maxValue * unitHeight : 0;
    var variables = this.props.variables;
    var stepWidth = this.props.width / variables.length;
    return (
      <g>
        {
          variables.map((variable, variableIndex) => {
            var isThinBar = variable.isSubtotal && ! variable.isCollapsed;
            var style = {
              fill: variable.color ? 'rgb(' + variable.color.join(',') + ')' : this.props.noColorFill,
              opacity: variable.code === this.props.activeVariableCode ? 1 : this.props.rectOpacity,
              shapeRendering: 'crispedges',
              stroke: variable.code === this.props.activeVariableCode ?
                this.props.strokeActive : this.props.strokeInactive,
              strokeWidth: isThinBar && 3,
            };
            var height = Math.abs(variable.value) * unitHeight;
            var y = y0 - Math.max(variable.baseValue, variable.baseValue + variable.value) * unitHeight;
            return (
              <g key={variable.code}>
                {
                  variable.code === this.props.activeVariableCode && (
                    <rect
                      className='highlight'
                      height={this.props.height}
                      style={{
                        fill: this.props.highlightColor,
                        opacity: 0.6,
                        stroke: this.props.highlightColor,
                      }}
                      width={stepWidth * 0.8}
                      x={(variableIndex + 0.1) * stepWidth}
                      y={0}
                    />
                  )
                }
                {
                  isThinBar ? (
                    <line
                      className='thin-bar'
                      style={style}
                      x1={(variableIndex + 0.5) * stepWidth}
                      y1={y}
                      x2={(variableIndex + 0.5) * stepWidth}
                      y2={height + y}
                    />
                  ) : (
                    <rect
                      className='bar'
                      height={height}
                      style={style}
                      width={stepWidth * 0.8}
                      x={(variableIndex + 0.1) * stepWidth}
                      y={y}
                    />
                  )
                }
              </g>
            );
          })
        }
      </g>
    );
  }
});

module.exports = WaterfallBars;
