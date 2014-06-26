/** @jsx React.DOM */
'use strict';

var React = require('react');


var MoveIndividuForm = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    return (
      <p>TODO</p>
    );
  }
});

module.exports = MoveIndividuForm;
