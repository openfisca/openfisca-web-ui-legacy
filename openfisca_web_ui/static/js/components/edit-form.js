/** @jsx React.DOM */
'use strict';

var React = require('react');


var EditForm = React.createClass({
  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    return (
      <form onSubmit={this.preventDefaultThen.bind(null, this.props.onClose)} role="form">
        <button className="close" title='Fermer' type="submit">
          <span aria-hidden="true">×</span>
          <span className="sr-only">Fermer</span>
        </button>
        <h2 style={{margin: 0, textAlign: 'center'}}>{this.props.title}</h2>
        <hr/>
        {this.props.children}
        <button className="btn btn-primary" type="submit">Fermer</button>
      </form>
    );
  }
});

module.exports = EditForm;
