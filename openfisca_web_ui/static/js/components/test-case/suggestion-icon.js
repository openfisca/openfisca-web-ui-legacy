/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react');


var SuggestionIcon = React.createClass({
  propTypes: {
    children: React.PropTypes.string.isRequired,
  },
  componentDidMount: function() {
    $(this.getDOMNode()).tooltip();
  },
  componentDidUpdate: function() {
    $(this.getDOMNode()).tooltip('fixTitle');
  },
  render: function() {
    return this.transferPropsTo(
      <span
        className='glyphicon glyphicon-info-sign'
        data-placement="top"
        data-toggle="tooltip"
        style={{marginLeft: 10}}
        title={this.props.children}
      />
    );
  }
});

module.exports = SuggestionIcon;
