/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');


var JsonVisualization = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    data: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <div>
        <p>{this.getIntlMessage('jsonSimulationResult')}</p>
        <pre>{JSON.stringify(this.props.data, null, 2)}</pre>
      </div>
    );
  },
});

module.exports = JsonVisualization;
