/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');


var VisualizationSelect = React.createClass({
  mixins: [ReactIntlMixin],
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
        <option value="waterfall">{this.getIntlMessage('waterfall')}</option>
        <option value="bareme">{this.getIntlMessage('bareme')}</option>
        <option value="situateur-revdisp">{this.getIntlMessage('situatorOfRevdisp')}</option>
        <option value="situateur-sal">{this.getIntlMessage('situatorOfSal')}</option>
        <option value="json">{this.getIntlMessage('jsonExport')}</option>
      </select>
    );
  }
});

module.exports = VisualizationSelect;
