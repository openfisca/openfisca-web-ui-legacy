/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');

var appconfig = global.appconfig;


var Label = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    children: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    required: React.PropTypes.bool,
  },
  render: function() {
    var label = this.props.children;
    if (this.props.required) {
      label += ' *';
    }
    return (
      <label className="control-label" htmlFor={this.props.name}>
        {label}
        <a
          className="btn btn-default btn-xs"
          href={appconfig['www.url'] + 'outils/variables/' + this.props.name}
          style={{marginLeft: 10}}
          target="_blank"
          title={
            this.formatMessage(this.getIntlMessage('columnExplanationLinkTitle'), {columnName: this.props.name})
          }>
          {this.getIntlMessage('columnExplanationLink')}
        </a>
      </label>
    );
  }
});

module.exports = Label;
