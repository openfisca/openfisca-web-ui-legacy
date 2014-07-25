/** @jsx React.DOM */
'use strict';

var React = require('react'),
  invariant = require('react/lib/invariant');

var CerfaField = require('./cerfa-field');


var BooleanControl = React.createClass({
  propTypes: {
    cerfaField: React.PropTypes.any,
    default: React.PropTypes.bool,
    error: React.PropTypes.string,
    label: React.PropTypes.component.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    suggestionExplanation: React.PropTypes.string,
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
    this.props.onChange(valueToBoolean(event.target.value));
  },
  render: function() {
    var booleanToString = function(value) { return value ? 'Oui' : 'Non'; };
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
            {
              this.props.suggestion ?
                'valeur suggérée : ' + booleanToString(this.props.suggestion) : // jshint ignore:line
                'valeur par défaut : ' + booleanToString(this.props.default) // jshint ignore:line
            }
          </div>
        </div>
        {
          this.props.cerfaField && (
            <div className="col-md-8">
              <CerfaField value={this.props.cerfaField} />
            </div>
          )
        }
      </div>
    );
  }
});

module.exports = BooleanControl;
