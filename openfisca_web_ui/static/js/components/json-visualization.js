/** @jsx React.DOM */
'use strict';

var React = require('react');


var JsonVisualization = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <pre>{JSON.stringify(this.props.data, null, 2)}</pre>
    );
  },
});

module.exports = JsonVisualization;
