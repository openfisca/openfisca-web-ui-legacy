/** @jsx React.DOM */
'use strict';

var React = require('react'),
strformat = require('strformat');


var WaterfallBarHover = React.createClass({
  propTypes: {
    barHeight: React.PropTypes.number.isRequired,
    barWidth: React.PropTypes.number.isRequired,
    enableLabelsHover: React.PropTypes.bool.isRequired,
    labelHeight: React.PropTypes.number.isRequired,
    labelWidth: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func,
    onHover: React.PropTypes.func.isRequired,
    variable: React.PropTypes.object.isRequired,
  },
  getDefaultProps: function() {
    return {
      labelHeight: 14,
    };
  },
  render: function() {
    var barRect = (
      <rect
        height={this.props.barHeight}
        onClick={this.props.onClick}
        onMouseOut={this.props.onHover.bind(null, null)}
        onMouseOver={this.props.onHover.bind(null, this.props.variable)}
        style={{opacity: 0}}
        width={this.props.barWidth}
      />
    );
    return this.props.enableLabelsHover ? (
      <g>
        {barRect}
        <g transform={strformat('translate(0, {y}) rotate(-45, {cx}, 0)', {
          cx: this.props.labelWidth,
          y: this.props.barHeight,
        })}>
          <rect
            height={this.props.labelHeight}
            onClick={this.props.onClick}
            onMouseOut={this.props.onHover.bind(null, null)}
            onMouseOver={this.props.onHover.bind(null, this.props.variable)}
            style={{opacity: 1}}
            width={this.props.labelWidth}
          />
        </g>
      </g>
    ) : barRect;
  }
});

module.exports = WaterfallBarHover;
