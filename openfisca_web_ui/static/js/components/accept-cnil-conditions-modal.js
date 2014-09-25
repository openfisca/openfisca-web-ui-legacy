/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react'),
  ReactIntlMixin = require('react-intl');


var AcceptCnilConditionsModal = React.createClass({
  mixins: [ReactIntlMixin],
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
                <h4 className="modal-title">{this.getIntlMessage('acceptCnilConditionsModalTitle')}</h4>
              </div>
              <div className="modal-body">
                <p>
                  <a target="_blank" href={this.props.termsUrlPath}>{this.getIntlMessage('acceptCnilConditionsModalTermsLink')}</a>
                </p>
                <div className="checkbox">
                  <label>
                    <input
                      name="accept-checkbox"
                      onChange={this.handleAcceptCheckboxChange}
                      type="checkbox"
                    />
                    {this.getIntlMessage('acceptCnilConditionsModalAcceptCheckboxLabel')}
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input
                      disabled={! this.state.acceptCheckboxChecked}
                      name="accept-stats-checkbox"
                      type="checkbox"
                    />
                    {this.getIntlMessage('acceptCnilConditionsModalAcceptStatsCheckboxLabel')}
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  disabled={! this.state.acceptCheckboxChecked}
                  name="accept"
                  type="submit">
                  <span className="glyphicon glyphicon-ok"></span>
                  {' ' + this.getIntlMessage('accept')}
                </button>
                <button className="btn btn-danger" onClick={this.logout} type="button">
                  <span className="glyphicon glyphicon-remove"></span>
                  {' ' + this.getIntlMessage('deny')}
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
