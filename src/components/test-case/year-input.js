import classNames from 'classNames'
import {Component} from 'react'

var polyfills = require('../../polyfills');

var appconfig = global.appconfig

export default class YearInput extends Component {
  propTypes: {
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    error: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.number.isRequired,
  }
  handleChange(event) {
    var newValue = polyfills.valueAsNumber(event.target);
    this.props.onChange(newValue);
  }
  render() {
    return (
      <div className={classNames(this.props.className, classNames({'has-error': this.props.error}))}>
        <input
          className="form-control"
          disabled={this.props.disabled}
          max={appconfig.constants.maxYear}
          min={appconfig.constants.minYear}
          onChange={this.handleChange}
          placeholder={appconfig.constants.defaultYear}
          step={1}
          title={this.props.error || this.getIntlMessage('simulationYear')}
          type="number"
          value={this.props.value}
        />
      </div>
    );
  }
}
