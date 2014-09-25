/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');


var Role = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    error: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    maxCardinality: React.PropTypes.number,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    role: React.PropTypes.string.isRequired,
  },
  render: function() {
    var maxCardinality = this.props.maxCardinality;
    var addLink = typeof maxCardinality === 'undefined' || ! this.props.children ||
      this.props.children.length < maxCardinality;
    return (
      <div className="list-group-item">
        <p>{this.props.label}</p>
        {this.props.error && <p className="text-danger">{this.props.error}</p>}
        {this.props.children}
        {
          addLink && (
            <a href="#" onClick={event => { event.preventDefault(); this.props.onCreateIndividuInEntity(); }}>
              {this.getIntlMessage('add')}
            </a>
          )
        }
      </div>
    );
  },
});

module.exports = Role;
