/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react');


var AcceptCnilConditionsModal = React.createClass({
  propTypes: {
    actionUrlPath: React.PropTypes.string.isRequired,
    termsUrlPath: React.PropTypes.string.isRequired,
  },
  componentDidMount: function() {
    $(this.getDOMNode()).modal({
      backdrop: 'static',
      keyboard: false,
      show: true,
    });
  },
  getInitialState: function() {
    return {
      acceptCheckboxChecked: false,
    };
  },
  handleAcceptCheckboxChange: function(event) {
    this.setState({acceptCheckboxChecked: event.target.checked});
  },
  logout: function() {
    navigator.id.logout();
  },
  render: function() {
    return (
      <div className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <form method="post" action={this.props.actionUrlPath}>
              <div className="modal-header">
                <h4 className="modal-title">Enregistrement de votre simulation</h4>
              </div>
              <div className="modal-body">
                <p>
                  <a target="_blank" href={this.props.termsUrlPath}>
                    Vous pouvez consulter les conditions générales d'utilisation ici.
                  </a>
                </p>
                <div className="checkbox">
                  <label>
                    <input
                      name="accept-checkbox"
                      onChange={this.handleAcceptCheckboxChange}
                      type="checkbox"
                    />
                    J'ai pris connaissance des conditions générales d'utilisation
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input
                      disabled={! this.state.acceptCheckboxChecked}
                      name="accept-stats-checkbox"
                      type="checkbox"
                    />
                    J'accepte que mes données soient utilisées à des fins statistiques,
                    après anonymisation.
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  disabled={! this.state.acceptCheckboxChecked}
                  name="accept"
                  type="submit">
                  <span className="glyphicon glyphicon-ok"></span> Accepter
                </button>
                <button className="btn btn-danger" onClick={this.logout} type="button">
                  <span className="glyphicon glyphicon-remove"></span> Refuser
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  },
});

module.exports = AcceptCnilConditionsModal;
