import {Component} from 'react'

export default class VisualizationSelect extends Component {
  propTypes: {
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
  }
  handleChange(event) {
    this.props.onChange(event.target.value);
  }
  render() {
    return (
      <select
        className="form-control"
        disabled={this.props.disabled}
        onChange={this.handleChange}
        title={this.getIntlMessage('visualization')}
        value={this.props.value}
      >
        <option value="waterfall">{this.getIntlMessage('waterfall')}</option>
        <option value="bareme">{this.getIntlMessage('bareme')}</option>
        <option value="situateur-revdisp">{this.getIntlMessage('situatorOfRevdisp')}</option>
        <option value="situateur-sal">{this.getIntlMessage('situatorOfSal')}</option>
      </select>
    );
  }
}
