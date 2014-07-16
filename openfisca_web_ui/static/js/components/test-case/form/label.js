/** @jsx React.DOM */
'use strict';

var React = require('react');

var appconfig = global.appconfig;


var Label = React.createClass({
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
          style={{marginLeft: 5}}
          target="_blank"
          title={'Explication sur ' + this.props.name}>
          ?
        </a>
      </label>
    );
  }
});

module.exports = Label;
