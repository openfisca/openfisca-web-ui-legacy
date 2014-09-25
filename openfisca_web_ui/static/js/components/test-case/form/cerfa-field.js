/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react'),
  ReactIntlMixin = require('react-intl');


var CerfaField = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    value: React.PropTypes.any.isRequired,
  },
  render: function() {
    var count = typeof this.props.value === 'object' ? Object.keys(this.props.value).length : 1;
    var helpMessage = this.formatMessage(this.getIntlMessage('cerfaHint'), {
      count: count,
      value: count > 1 ? Lazy(this.props.value).join(', ') : this.props.value,
    });
    return <span className="help-block">{helpMessage}</span>;
  }
});

module.exports = CerfaField;
