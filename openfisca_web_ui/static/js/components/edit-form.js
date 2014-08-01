/** @jsx React.DOM */
'use strict';

var React = require('react');


var EditForm = React.createClass({
  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
  render: function() {
    return (
      <form role="form">
        <button className="close" onClick={this.props.onClose} type="button">
          <span aria-hidden="true">×</span>
          <span className="sr-only">Fermer</span>
        </button>
        <h2 style={{margin: 0, textAlign: 'center'}}>{this.props.title}</h2>
        <hr/>
        {this.props.children}
        <button className="btn btn-default" onClick={this.props.onClose} type="button">Fermer</button>
      </form>
    );
  }
});

module.exports = EditForm;
