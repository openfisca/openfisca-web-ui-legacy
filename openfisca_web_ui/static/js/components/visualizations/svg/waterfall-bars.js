/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  React = require('react/addons');


var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var WaterfallBars = React.createClass({
  propTypes: {
    activeVariableCode: React.PropTypes.string,
//    blueFillColor: React.PropTypes.string.isRequired,
//    blueStrokeColor: React.PropTypes.string.isRequired,
//    greenFillColor: React.PropTypes.string.isRequired,
//    greenStrokeColor: React.PropTypes.string.isRequired,
    height: React.PropTypes.number.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    rectOpacity: React.PropTypes.number.isRequired,
//    redFillColor: React.PropTypes.string.isRequired,
//    redStrokeColor: React.PropTypes.string.isRequired,
    strokeActive: React.PropTypes.string.isRequired,
    strokeInactive: React.PropTypes.string.isRequired,
    valueMax: React.PropTypes.number.isRequired,
    valueMin: React.PropTypes.number.isRequired,
    variables: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
//      blueFillColor: '#80B1D3',
//      blueStrokeColor: '#6B94B0',
//      greenFillColor: '#B3DE69',
//      greenStrokeColor: '#95B957',
      noColorFill: 'gray',
      rectOpacity: 0.8,
      strokeActive: 'black',
      strokeInactive: 'gray',
//      redFillColor: '#FB8072',
//      redStrokeColor: '#D26B5F',
    };
  },
  render: function() {
    var unitHeight = this.props.height / (this.props.valueMax - this.props.valueMin);
    var y0 = this.props.valueMax > 0 ? this.props.valueMax * unitHeight : 0;
    var bars = this.props.variables.map(function(variable) {
      return {
        baseValue: variable.baseValue,
        code: variable.code,
        color: variable.color,
        hasChildren: !! variable.children,
        height: Math.abs(variable.value) * unitHeight,
        name: variable.name,
        type: variable.type,
        value: variable.value,
        y: y0 - Math.max(variable.baseValue, variable.baseValue + variable.value) * unitHeight,
      };
    }, this);
    var tickWidth = this.props.width / bars.length;
    return (
      <ReactCSSTransitionGroup component={React.DOM.g} transitionName="bar">
        {
          bars.map(function(bar, barIndex) {
            invariant(bar.type === 'bar' || bar.type === 'var', 'bar.type is neither "bar" nor "var": %s', bar.type);
            var style = {
              fill: bar.color ? 'rgb(' + bar.color.join(',') + ')' : this.props.noColorFill,
//              fill: bar.type === 'bar' ? this.props.blueFillColor :
//                bar.value > 0 ? this.props.greenFillColor : this.props.redFillColor,
              opacity: bar.code === this.props.activeVariableCode ? 1 : this.props.rectOpacity,
//              stroke: bar.type === 'bar' ? this.props.blueStrokeColor :
//                bar.value > 0 ? this.props.greenStrokeColor : this.props.redStrokeColor,
              shapeRendering: 'crispedges',
              stroke: bar.code === this.props.activeVariableCode ? this.props.strokeActive : this.props.strokeInactive,
              strokeWidth: bar.type === 'bar' && 3,
            };
            return (
              bar.type === 'var' ? (
                <rect
                  height={bar.height}
                  key={bar.code}
                  style={style}
                  width={tickWidth * 0.8}
                  x={(barIndex + 0.1) * tickWidth}
                  y={bar.y}
                />
              ) : (
                <line
                  key={bar.code}
                  style={style}
                  x1={(barIndex + 0.5) * tickWidth}
                  y1={bar.y}
                  x2={(barIndex + 0.5) * tickWidth}
                  y2={bar.height + bar.y}
                />
              )
            );
          }, this)
        }
      </ReactCSSTransitionGroup>
    );
  }
});

module.exports = WaterfallBars;
