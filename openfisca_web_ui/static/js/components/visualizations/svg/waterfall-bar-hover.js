/** @jsx React.DOM */
'use strict';

var React = require('react'),
strformat = require('strformat');


var WaterfallBarHover = React.createClass({
  propTypes: {
    barHeight: React.PropTypes.number.isRequired,
    barWidth: React.PropTypes.number.isRequired,
    labelHeight: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func,
    onHover: React.PropTypes.func.isRequired,
    variable: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <g>
        <rect
          height={this.props.barHeight}
          onClick={this.props.onClick}
          onMouseOut={this.props.onHover.bind(null, null)}
          onMouseOver={this.props.onHover.bind(null, this.props.variable)}
          style={{opacity: 0}}
          width={this.props.barWidth}
        />
        <g transform={strformat('translate({x}, {y}) rotate(-45)', {
          x: - this.props.labelHeight / 2,
          y: this.props.barHeight + this.props.labelHeight - this.props.barWidth,
        })}>
          <rect
            height={this.props.barWidth}
            onClick={this.props.onClick}
            onMouseOut={this.props.onHover.bind(null, null)}
            onMouseOver={this.props.onHover.bind(null, this.props.variable)}
            style={{opacity: 0}}
            width={this.props.labelHeight}
          />
        </g>
      </g>
    );
  }
});

module.exports = WaterfallBarHover;
