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
    suggestionExplanation: React.PropTypes.string,
    value: React.PropTypes.string,
  },
  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },
  render: function() {
    return (
      <div>
        {this.props.label}
        {
          this.props.suggestion && ! this.props.error && (
            <span
              className='glyphicon glyphicon-info-sign'
              style={{marginLeft: 10}}
              title={this.props.suggestionExplanation}
            />
          )
        }
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
