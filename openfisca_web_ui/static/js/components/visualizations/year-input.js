/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');

var appconfig = global.appconfig;


var YearInput = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    error: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.number.isRequired,
  },
  handleChange: function(event) {
    this.props.onChange(event.target.valueAsNumber);
  },
  render: function() {
    return (
      <input
        className="form-control"
        max={appconfig.constants.maxYear}
        min={appconfig.constants.minYear}
        onChange={this.handleChange}
        placeholder={appconfig.constants.defaultYear}
        step="1"
        title={this.props.error || this.getIntlMessage('simulationYear')}
        type="number"
        value={this.props.value}
      />
    );
  },
});

module.exports = YearInput;
