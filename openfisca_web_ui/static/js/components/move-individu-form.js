/** @jsx React.DOM */
'use strict';

var React = require('react');


var MoveIndividuForm = React.createClass({
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
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
          <div className="col-sm-2">
            <button className="btn btn-default" onClick={this.props.onCancel} type="button">
              Annuler
            </button>
          </div>
          <div className="col-sm-8">
            <h2 style={{margin: 0, textAlign: 'center'}}>{this.props.title}</h2>
          </div>
          <div className="col-sm-2">
            <button className="btn btn-primary" style={{marginRight: 5}} type="submit">
              Enregistrer
            </button>
          </div>
        </div>
        <hr/>
        <div>
          TODO
        </div>
      </form>
    );
  }
});

module.exports = MoveIndividuForm;
