/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');

var polyfills = require('../../polyfills');


var appconfig = global.appconfig,
  cx = React.addons.classSet;


var YearInput = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    error: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.number.isRequired,
  },
  handleChange(event) {
    var newValue = polyfills.valueAsNumber(event.target);
    this.props.onChange(newValue);
  },
  render() {
    return (
      <div className={cx(this.props.className, cx({'has-error': this.props.error}))}>
        <input
          className="form-control"
          disabled={this.props.disabled}
          max={appconfig.constants.maxYear}
          min={appconfig.constants.minYear}
          onChange={this.handleChange}
          placeholder={appconfig.constants.defaultYear}
          step="1"
          title={this.props.error || this.getIntlMessage('simulationYear')}
          type="number"
          value={this.props.value}
        />
      </div>
    );
  },
});

module.exports = YearInput;
