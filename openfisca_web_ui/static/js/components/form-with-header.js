/** @jsx React.DOM */
'use strict';

var React = require('react');


var FormWithHeader = React.createClass({
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    return (
      <form onSubmit={this.preventDefaultThen.bind(null, this.props.onSave)} role="form">
        <div className="row">
          <div className="col-sm-3">
            <button className="btn btn-default" onClick={this.props.onCancel} type="button">Annuler</button>
          </div>
          <div className="col-sm-6">
            <h2 style={{margin: 0, textAlign: 'center'}}>{this.props.title}</h2>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-primary pull-right" type="submit">Enregistrer</button>
          </div>
        </div>
        <hr/>
        {this.props.children}
      </form>
    );
  }
});

module.exports = FormWithHeader;
