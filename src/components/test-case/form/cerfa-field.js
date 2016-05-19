import {Component} from 'react'

export default class CerfaField extends Component {
  propTypes: {
    value: React.PropTypes.any.isRequired,
  },
  render() {
    var count = typeof this.props.value === 'object' ? Object.keys(this.props.value).length : 1;
    var helpMessage = this.formatMessage(this.getIntlMessage('cerfaHint'), {
      count: count,
      value: count > 1 ? Lazy(this.props.value).join(', ') : this.props.value,
    });
    return <span className="help-block">{helpMessage}</span>;
  }
}
