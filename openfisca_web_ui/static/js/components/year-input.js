/** @jsx React.DOM */
'use strict';

var React = require('react');

var appconfig = global.appconfig;


var YearInput = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.number.isRequired,
  },
  render: function() {
    return (
      <input
        className="form-control"
        max={appconfig.constants.maxYear}
        min={appconfig.constants.minYear}
        onChange={this.props.onChange}
        placeholder={appconfig.constants.defaultYear}
        step="1"
        title="Année"
        type="number"
        value={this.props.value}
      />
    );
  }
});

module.exports = YearInput;
