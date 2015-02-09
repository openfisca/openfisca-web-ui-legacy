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
  componentDidMount() {
    $(this.getDOMNode()).modal({
      backdrop: 'static',
      keyboard: false,
      show: true,
    });
  },
  getInitialState() {
    return {
      acceptCheckboxChecked: false,
    };
  },
  handleAcceptCheckboxChange(event) {
    this.setState({acceptCheckboxChecked: event.target.checked});
  },
  render() {
    return (
      <div className="modal fade" role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
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
              <p>{this.getIntlMessage('acceptCookiesModalParagraph4')}</p>
            </div>
            <div className="modal-footer">
              <form action={this.props.actionUrlPath} method="post" role='form'>
                <div className="checkbox pull-left">
                  <input
                    checked={this.state.acceptCheckboxChecked}
                    id='acceptCheckbox'
                    name="accept-checkbox"
                    onChange={this.handleAcceptCheckboxChange}
                    style={{marginLeft: 0}}
                    type="checkbox"
                  />
                  <label htmlFor='acceptCheckbox'>{this.getIntlMessage('acceptCookiesModalCheckboxLabel')}</label>
                </div>
                <button
                  className="btn btn-success"
                  disabled={! this.state.acceptCheckboxChecked}
                  name="accept"
                  type="submit">
                  {this.getIntlMessage('accept')}
                </button>
                <a className="btn btn-danger" href={appconfig['urls.www']}>{this.getIntlMessage('deny')}</a>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

module.exports = AcceptCookiesModal;
