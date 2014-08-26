/** @jsx React.DOM */
'use strict';

var React = require('react');

var Tooltip = require('../tooltip');


var SuggestionIcon = React.createClass({
  propTypes: {
    children: React.PropTypes.string.isRequired,
  },
  render: function() {
    return (
      <Tooltip>
        {
          this.transferPropsTo(
            <span
              className='glyphicon glyphicon-info-sign'
              style={{marginLeft: 10}}
              title={this.props.children}
            />
          )
        }
      </Tooltip>
    );
  }
});

module.exports = SuggestionIcon;
