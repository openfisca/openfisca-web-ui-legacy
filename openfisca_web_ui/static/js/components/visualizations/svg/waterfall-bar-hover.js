/** @jsx React.DOM */
'use strict';

var React = require('react');


var WaterfallBarHover = React.createClass({
  propTypes: {
    barHeight: React.PropTypes.number.isRequired,
    barWidth: React.PropTypes.number.isRequired,
    labelHeight: React.PropTypes.number.isRequired,
    labelWidth: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func,
    onHover: React.PropTypes.func.isRequired,
    variable: React.PropTypes.object.isRequired,
  },
  getDefaultProps() {
    return {
      labelHeight: 14,
    };
  },
  render() {
    return (
      <rect
        height={this.props.barHeight}
        onClick={this.props.onClick}
        onMouseOut={this.props.onHover.bind(null, null)}
        onMouseOver={this.props.onHover.bind(null, this.props.variable)}
        style={{opacity: 0}}
        width={this.props.barWidth}
      />
    );
  }
});

module.exports = WaterfallBarHover;
