import {Component} from 'react'

export default class DateControl extends Component {
  propTypes: {
    default: React.PropTypes.string,
    error: React.PropTypes.string,
    label: React.PropTypes.element.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    value: React.PropTypes.string,
  }
  handleChange(event) {
    this.props.onChange(event.target.value);
  }
  render() {
    return (
      <div>
        {this.props.label}
        <input
          className="form-control"
          id={this.props.name}
          placeholder={this.props.suggestion || this.props.default}
          type="date"
        />
      </div>
    );
  }
}
