/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  React = require('react');


var WaterfallBars = React.createClass({
  propTypes: {
    activeVariablesCodes: React.PropTypes.arrayOf(React.PropTypes.string),
    displayVariablesColors: React.PropTypes.bool,
    height: React.PropTypes.number.isRequired,
    highlightColor: React.PropTypes.string.isRequired,
    negativeColor: React.PropTypes.string.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    positiveColor: React.PropTypes.string.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    minValue: React.PropTypes.number.isRequired,
    tweenProgress: React.PropTypes.number,
    variables: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      highlightColor: '#eee',
      negativeColor: 'red',
      noColorFill: 'gray',
      positiveColor: 'green',
      tweenProgress: null,
    };
  },
  render: function() {
    var unitHeight = this.props.height / (this.props.maxValue - this.props.minValue);
    var y0 = this.props.maxValue > 0 ? this.props.maxValue * unitHeight : 0;
    var stepWidth = this.props.width / this.props.variables.length;
    var widthAtStart = stepWidth;
    if (this.props.tweenProgress !== null) {
      invariant(this.props.activeVariablesCodes && this.props.activeVariablesCodes.length,
        'this.props.tweenProgress is not null and no this.props.activeVariablesCodes given');
      var nbTweeningVariables = this.props.activeVariablesCodes.length;
      var nbNonTweeningVariables = this.props.variables.length - nbTweeningVariables;
      var widthAtEnd = this.props.width / (nbNonTweeningVariables + 1);
      var tweeningVariablesWidth = (widthAtEnd - widthAtStart * nbTweeningVariables) * this.props.tweenProgress +
        widthAtStart * nbTweeningVariables;
      var tweenWidth = tweeningVariablesWidth / nbTweeningVariables;
      var nonTweenWidth = (this.props.width - tweeningVariablesWidth) / nbNonTweeningVariables;
    }
    var nextBarX = 0;
    return (
      <g className='bars'>
        {
          this.props.variables.map((variable, variableIndex) => {
            var isActive = this.props.activeVariablesCodes && this.props.activeVariablesCodes.includes(variable.code),
              isThinBar = variable.isSubtotal && ! variable.isCollapsed;
            var style = {
              fill: this.props.displayVariablesColors ?
                (variable.color ? `rgb(${variable.color.join(',')})` : this.props.noColorFill) :
                (variable.value > 0 ? this.props.positiveColor : this.props.negativeColor),
              shapeRendering: 'crispedges',
              stroke: 'black',
              strokeWidth: isThinBar && 3,
            };
            var height = Math.abs(variable.value) * unitHeight;
            var width = this.props.tweenProgress === null ? widthAtStart : (isActive ? tweenWidth : nonTweenWidth);
            var rectWidth = width * 0.8;
            var x = nextBarX + width * 0.1;
            var y = y0 - Math.max(variable.baseValue, variable.baseValue + variable.value) * unitHeight;
            var highlightRectX = nextBarX;
            nextBarX += width;
            return (
              <g key={variable.code}>
                {
                  isActive && (
                    <rect
                      className='highlight'
                      height={this.props.height}
                      style={{
                        fill: this.props.highlightColor,
                        opacity: 0.8,
                        stroke: this.props.highlightColor,
                      }}
                      width={width}
                      x={highlightRectX}
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
                      width={rectWidth}
                      x={x}
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
