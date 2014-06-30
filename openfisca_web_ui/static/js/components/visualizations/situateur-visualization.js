/** @jsx React.DOM */
'use strict';

var React = require('react/addons');


var SituateurVisualization = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      height: 400,
    };
  },
  render: function() {
    return (
      <svg height={this.props.height} width="100%">
        {
          React.Children.map(this.props.children, function(child) {
            var newProps = {
              height: this.props.height,
              width: this.props.width,
              xMaxValue: this.props.xMaxValue,
              yMaxValue: this.props.yMaxValue,
            };
            return React.addons.cloneWithProps(child, newProps);
          }, this)
        }
      </svg>
    );
  },
});

module.exports = SituateurVisualization;
