/** @jsx React.DOM */
'use strict';

var React = require('react');


var DateControl = React.createClass({
  propTypes: {
    default: React.PropTypes.bool,
    error: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    value: React.PropTypes.string,
  },
  handleChange: function(event) {
    this.props.onChange(this.props.name, event.target.value);
  },
  render: function() {
    return (
      <div>
        <label className="control-label" htmlFor={this.props.name}>{this.props.label}</label>
        <input
          className="form-control"
          id={this.props.name}
          placeholder={this.props.suggestion || this.props.default}
          type="date"
        />
      </div>
    );
  }
});

module.exports = DateControl;
