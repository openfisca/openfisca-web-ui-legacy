/** @jsx React.DOM */
'use strict';

var React = require('react');

var CerfaField = require('./cerfa-field'),
  SuggestionGlyphicon = require('./suggestion-glyphicon');


var IntegerControl = React.createClass({
  propTypes: {
    cerfaField: React.PropTypes.any,
    default: React.PropTypes.number,
    error: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    max: React.PropTypes.number,
    min: React.PropTypes.number,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.number,
    value: React.PropTypes.number,
    valType: React.PropTypes.string,
  },
  handleChange: function(event) {
    this.props.onChange(this.props.name, event.target.valueAsNumber);
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
        <label className="control-label" htmlFor={this.props.name}>{this.props.label}</label>
        <div className="row">
          <div className="col-md-4">
            {
              this.props.valType === 'monetary' || this.props.suggestion && ! this.props.error ? (
                <div className="input-group">
                  {input}
                  <span className="input-group-addon">
                  {
                    this.props.valType === 'monetary' ?
                      <span className="glyphicon glyphicon-euro"></span>
                      : null
                  }
                  {
                    this.props.suggestion && ! this.props.error ?
                      <SuggestionGlyphicon />
                      : null
                  }
                  </span>
                </div>
              ) : input
            }
          </div>
          {
            this.props.cerfaField ?
              <div className="col-md-8">
                <CerfaField value={this.props.cerfaFields} />
              </div>
              : null
          }
        </div>
      </div>
    );
  }
});

module.exports = IntegerControl;
