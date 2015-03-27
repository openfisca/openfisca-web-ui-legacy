/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  React = require('react'),
  ReactIntlMixin = require('react-intl');

var CerfaField = require('./cerfa-field');


var BooleanControl = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    cerfaField: React.PropTypes.any,
    default: React.PropTypes.bool,
    error: React.PropTypes.string,
    label: React.PropTypes.element.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.bool,
    value: React.PropTypes.bool,
  },
  handleChange(event) {
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
  render() {
    var booleanToString = function(value) { return value ? 'Oui' : 'Non'; };
    return (
      <div>
        {this.props.label}
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
              {this.getIntlMessage('notIndicated')}
            </label>
            <label className="radio-inline">
              <input
                checked={this.props.value}
                name={this.props.name}
                onChange={this.handleChange}
                type="radio"
                value="1"
              />
              {this.getIntlMessage('yes')}
            </label>
            <label className="radio-inline">
              <input
                checked={this.props.value === false}
                name={this.props.name}
                onChange={this.handleChange}
                type="radio"
                value="0"
              />
              {this.getIntlMessage('no')}
            </label>
          </div>
          <div className="col-sm-6">
            {
              this.props.suggestion !== undefined ?
                this.formatMessage(this.getIntlMessage('suggestedValue'), {
                  value: booleanToString(this.props.suggestion),
                }) :
                this.formatMessage(this.getIntlMessage('defaultValue'), {
                  value: booleanToString(this.props.default),
                })
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
