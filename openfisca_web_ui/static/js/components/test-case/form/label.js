/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');

var Tooltip = require('../../tooltip');

var appconfig = global.appconfig;


var Label = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    children: React.PropTypes.string.isRequired,
    hasSuggestion: React.PropTypes.bool,
    name: React.PropTypes.string.isRequired,
    required: React.PropTypes.bool,
  },
  render() {
    return (
      <label className="control-label" htmlFor={this.props.name}>
        {
          this.props.required ? (
            <Tooltip placement='top'>
              <span title={this.getIntlMessage('requiredFieldTooltip')}>
                {`${this.props.children} *`}
              </span>
            </Tooltip>
          ) : this.props.hasSuggestion ? (
            <Tooltip placement='top'>
              <span
                style={{
                  color: 'red',
                  fontStyle: 'italic',
                }}
                title={this.getIntlMessage('suggestedValueExplanation')}>
                {this.props.children}
              </span>
            </Tooltip>
          ) : this.props.children
        }
        <Tooltip placement='top'>
          <a
            href={`${appconfig['urls.www']}outils/variables/${this.props.name}`}
            style={{marginLeft: 10}}
            target='_blank'
            title={this.formatMessage(this.getIntlMessage('inspectColumnLinkTitle'), {name: this.props.name})}>
            <span className='glyphicon glyphicon-question-sign'></span>
          </a>
        </Tooltip>
      </label>
    );
  }
});

module.exports = Label;
