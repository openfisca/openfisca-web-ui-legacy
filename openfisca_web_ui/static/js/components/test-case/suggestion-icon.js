/** @jsx React.DOM */
'use strict';

var React = require('react');

var Tooltip = require('../tooltip');


var SuggestionIcon = React.createClass({
  propTypes: {
    children: React.PropTypes.string.isRequired,
  },
  render: function() {
    var {children, ...otherProps} = this.props;
    return (
      <Tooltip>
        <span
          className='glyphicon glyphicon-info-sign'
          style={{marginLeft: 10}}
          title={children}
          {...otherProps}
        />
      </Tooltip>
    );
  }
});

module.exports = SuggestionIcon;
