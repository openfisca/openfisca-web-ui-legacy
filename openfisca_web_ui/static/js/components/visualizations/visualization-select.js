/** @jsx React.DOM */
'use strict';

var React = require('react');


var VisualizationSelect = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
  },
  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },
  render: function() {
    return (
      <select className="form-control" onChange={this.handleChange} value={this.props.value}>
        <option value="cascade">Cascade</option>
        <option value="bareme">Barême</option>
        <option value="situateur-revdisp">Situateur de revenu disponible du ménage</option>
        <option value="situateur-sal">Situateur de salaires imposables</option>
        {/* <option value="rattachement-enfant">Rattachement enfants</option> */}
        <option value="json">Export données JSON</option>
      </select>
    );
  }
});

module.exports = VisualizationSelect;
