/** @jsx React.DOM */
'use strict';

var React = require('react');


var Role = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,
    error: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    maxCardinality: React.PropTypes.number,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    role: React.PropTypes.string.isRequired,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    var maxCardinality = this.props.maxCardinality;
    var addLink = (
      ! this.props.disabled && (
        typeof maxCardinality === 'undefined' || ! this.props.children || this.props.children.length < maxCardinality
      )
    ) && (
      <a href="#" onClick={this.preventDefaultThen.bind(null, this.props.onCreateIndividuInEntity)}>
        Ajouter
      </a>
    );
    return (
      <div className="list-group-item">
        <p>{this.props.label}</p>
        {this.props.error && <p className="text-danger">{this.props.error}</p>}
        {this.props.children}
        {addLink}
      </div>
    );
  },
});

module.exports = Role;
