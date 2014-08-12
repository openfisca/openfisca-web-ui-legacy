/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var EnumerationControl = React.createClass({
  propTypes: {
    default: React.PropTypes.string,
    error: React.PropTypes.string,
    label: React.PropTypes.component.isRequired,
    labels: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    suggestionIcon: React.PropTypes.component,
    value: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string,
    ]),
  },
  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },
  render: function() {
    return (
      <div>
        {this.props.label}
        {! this.props.error && this.props.suggestion && this.props.suggestionIcon}
        <select
          className="form-control"
          id={this.props.name}
          onChange={this.handleChange}
          value={this.props.value}>
          <option value="">Non renseigné ({
            this.props.suggestion ?
              'valeur suggérée : ' + this.props.labels[this.props.suggestion] : // jshint ignore:line
              'valeur par défaut : ' + this.props.labels[this.props.default] // jshint ignore:line
          })</option>
          {
            Lazy(this.props.labels).map((label, labelId) =>
              <option key={'label-' + labelId} value={labelId}>{label}</option>
            ).toArray()
          }
        </select>
      </div>
    );
  }
});

module.exports = EnumerationControl;
