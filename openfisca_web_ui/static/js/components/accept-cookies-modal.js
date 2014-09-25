/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react'),
  ReactIntlMixin = require('react-intl');


var appconfig = global.appconfig;


var AcceptCookiesModal = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    actionUrlPath: React.PropTypes.string.isRequired,
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
  render: function() {
    return (
      <div className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <form method="post" action={this.props.actionUrlPath}>
              <div className="modal-header">
                <h4 className="modal-title">
                  {this.getIntlMessage('acceptCookiesModalTitle') + ' '}
                  <small>{this.getIntlMessage('acceptCookiesModalTitleSmall')}</small>
                </h4>
              </div>
              <div className="modal-body">
                <p>{this.getIntlMessage('acceptCookiesModalParagraph1')}</p>
                <p>{this.getIntlMessage('acceptCookiesModalParagraph2')}</p>
                <p>{this.getIntlMessage('acceptCookiesModalParagraph3')}</p>
                <div className="checkbox">
                  <label>
                    <input
                      checked={this.state.acceptCheckboxChecked}
                      name="accept-checkbox"
                      onChange={this.handleAcceptCheckboxChange}
                      type="checkbox"
                    />
                    {this.getIntlMessage('acceptCookiesModalCheckboxLabel')}
                  </label>
                </div>
                <p>{this.getIntlMessage('acceptCookiesModalParagraph4')}</p>
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
                <a className="btn btn-danger" href={appconfig['www.url']}>
                  <span className="glyphicon glyphicon-remove"></span>
                  {' ' + this.getIntlMessage('deny')}
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  },
});

module.exports = AcceptCookiesModal;
