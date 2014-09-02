/** @jsx React.DOM */
'use strict';

var React = require('react');


var JsonVisualization = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <div>
        <p>Résultat brut de la simulation au format JSON :</p> {/* jshint ignore:line */}
        <pre>{JSON.stringify(this.props.data, null, 2)}</pre>
      </div>
    );
  },
});

module.exports = JsonVisualization;
