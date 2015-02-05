/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');


var VisualizationSelect = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
  },
  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },
  render: function() {
    return (
      <select
        className="form-control"
        disabled={this.props.disabled}
        onChange={this.handleChange}
        title={this.getIntlMessage('visualization')}
        value={this.props.value}
      >
        <option value="waterfall">{this.getIntlMessage('waterfall')}</option>
        <option value="bareme">{this.getIntlMessage('bareme')}</option>
        <option value="situateur-revdisp">{this.getIntlMessage('situatorOfRevdisp')}</option>
        <option value="situateur-sal">{this.getIntlMessage('situatorOfSal')}</option>
      </select>
    );
  }
});

module.exports = VisualizationSelect;
