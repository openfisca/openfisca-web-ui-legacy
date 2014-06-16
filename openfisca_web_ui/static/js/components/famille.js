/** @jsx React.DOM */
'use strict';

var React = require('react');


var Famille = React.createClass({
  propTypes: {
    value: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <div>Famille {this.props.value.nom_famille}</div> // jshint ignore:line
    );
  }
});

module.exports = Famille;
