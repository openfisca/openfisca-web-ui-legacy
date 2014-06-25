/** @jsx React.DOM */
'use strict';

var React = require('react'),
  invariant = require('react/lib/invariant');

var SuggestionGlyphicon = require('./suggestion-glyphicon');


var BooleanControl = React.createClass({
  propTypes: {
    default: React.PropTypes.bool,
    error: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    value: React.PropTypes.bool,
  },
  handleChange: function(event) {
    var valueToBoolean = function(value) {
      var booleanByValue = {
        '': null,
        '0': false,
        '1': true,
      };
      invariant(value in booleanByValue, 'unexpected value: ' + value);
      return booleanByValue[value];
    };
    this.props.onChange(this.props.name, valueToBoolean(event.target.value));
  },
  render: function() {
    var booleanToString = function(value) { return value ? 'Oui' : 'Non'; };
    return (
      <div>
        <label className="control-label">{this.props.label}</label>
        <div className="row">
          <div className="col-sm-6">
            <label className="radio-inline">
              <input
                checked={typeof this.props.value === 'undefined' || this.props.value === null}
                name={this.props.name}
                onChange={this.handleChange}
                type="radio"
                value=""
              />
              Non renseigné
            </label>
            <label className="radio-inline">
              <input
                checked={this.props.value}
                name={this.props.name}
                onChange={this.handleChange}
                type="radio"
                value="1"
              />
              Oui
            </label>
            <label className="radio-inline">
              <input
                checked={this.props.value === false}
                name={this.props.name}
                onChange={this.handleChange}
                type="radio"
                value="0"
              />
              Non
            </label>
          </div>
          <div className="col-sm-6">
            <span className="help-block">
              {
                this.props.suggestion ?
                  'valeur suggérée : ' + booleanToString(this.props.suggestion) : // jshint ignore:line
                  'valeur par défaut : ' + booleanToString(this.props.default) // jshint ignore:line
              }
              {
                this.props.suggestion && ! this.props.error ?
                  <SuggestionGlyphicon />
                  : null
              }
            </span>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = BooleanControl;
