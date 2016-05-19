import {Component} from 'react'

var appconfig = global.appconfig;

export default class Label extends Component {
  propTypes: {
    children: React.PropTypes.string.isRequired,
    hasSuggestion: React.PropTypes.bool,
    name: React.PropTypes.string.isRequired,
    required: React.PropTypes.bool,
  }
  render() {
    return (
      <label className="control-label" htmlFor={this.props.name}>
        {
          this.props.required ? (
            <span title={this.getIntlMessage('requiredFieldTooltip')}>
              {`${this.props.children} *`}
            </span>
          ) : this.props.hasSuggestion ? (
            <span
              style={{
                color: 'red',
                fontStyle: 'italic',
              }}
              title={this.getIntlMessage('suggestedValueExplanation')}>
              {this.props.children}
            </span>
          ) : this.props.children
        }
        <a
          href={`${appconfig['urls.www']}outils/variables/${this.props.name}`}
          style={{marginLeft: 10}}
          target='_blank'
          title={this.formatMessage(this.getIntlMessage('inspectColumnLinkTitle'), {name: this.props.name})}>
          <span className='glyphicon glyphicon-question-sign'></span>
        </a>
      </label>
    );
  }
}
