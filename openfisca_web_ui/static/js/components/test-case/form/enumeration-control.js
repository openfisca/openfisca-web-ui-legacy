/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react'),
  ReactIntlMixin = require('react-intl');


var EnumerationControl = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    default: React.PropTypes.string,
    error: React.PropTypes.string,
    label: React.PropTypes.component.isRequired,
    labels: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    value: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string,
    ]),
  },
  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },
  render: function() {
    var firstOptionLabel = `${this.getIntlMessage('notIndicated')} (${
      this.props.suggestion ?
        this.formatMessage(this.getIntlMessage('suggestedValue'), {value: this.props.labels[this.props.suggestion]}) :
        this.formatMessage(this.getIntlMessage('defaultValue'), {value: this.props.labels[this.props.default]})
      })`;
    return (
      <div>
        {this.props.label}
        <select
          className="form-control"
          id={this.props.name}
          onChange={this.handleChange}
          value={this.props.value}>
          <option value="">{firstOptionLabel}</option>
          {
            Lazy(this.props.labels).map((label, labelId) =>
              <option key={labelId} value={labelId}>{label}</option>
            ).toArray()
          }
        </select>
      </div>
    );
  }
});

module.exports = EnumerationControl;
