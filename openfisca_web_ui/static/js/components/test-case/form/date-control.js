/** @jsx React.DOM */
'use strict';

var React = require('react');


var DateControl = React.createClass({
  propTypes: {
    default: React.PropTypes.bool,
    error: React.PropTypes.string,
    label: React.PropTypes.component.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    suggestionIcon: React.PropTypes.component,
    value: React.PropTypes.string,
  },
  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },
  render: function() {
    return (
      <div>
        {this.props.label}
        {! this.props.error && this.props.suggestion && this.props.suggestionIcon}
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
