/** @jsx React.DOM */
'use strict';

var React = require('react');

var CerfaField = require('./cerfa-field');


var IntegerControl = React.createClass({
  propTypes: {
    cerfaField: React.PropTypes.any,
    default: React.PropTypes.number,
    error: React.PropTypes.string,
    label: React.PropTypes.component.isRequired,
    max: React.PropTypes.number,
    min: React.PropTypes.number,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.number,
    suggestionIcon: React.PropTypes.component,
    value: React.PropTypes.number,
    valType: React.PropTypes.string,
  },
  handleChange: function(event) {
    this.props.onChange(event.target.valueAsNumber);
  },
  render: function() {
    var input = (
      <input
        className="form-control"
        id={this.props.name}
        max={this.props.max}
        min={this.props.min}
        onChange={this.handleChange}
        placeholder={this.props.suggestion || this.props.default}
        step="1"
        type="number"
        value={this.props.value}
      />
    );
    return (
      <div>
        {this.props.label}
        {! this.props.error && this.props.suggestion && this.props.suggestionIcon}
        <div className="row">
          <div className="col-md-4">
            {
              this.props.valType === 'monetary' ? (
                <div className="input-group">
                  {input}
                  <span className="input-group-addon">
                    {this.props.valType === 'monetary' && <span className="glyphicon glyphicon-euro"></span>}
                  </span>
                </div>
              ) : input
            }
          </div>
          {
            this.props.cerfaField && (
              <div className="col-md-8">
                <CerfaField value={this.props.cerfaField} />
              </div>
            )
          }
        </div>
      </div>
    );
  }
});

module.exports = IntegerControl;
