/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  ReactIntlMixin = require('react-intl');


var SendFeedbackButton = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    className: React.PropTypes.string,
    testCase: React.PropTypes.object.isRequired,
  },
  render() {
    var sendFeedbackBody = `
Bonjour,

Je vous envoie mes remarques sur OpenFisca.

Les données ci-dessous vous aideront à résoudre mon problème.

Voici mon cas-type :

${JSON.stringify(this.props.testCase, null, 2)}
`;
    var sendFeedbackHref = `mailto:contact@openfisca.fr?subject=Retours sur OpenFisca&body=${encodeURIComponent(sendFeedbackBody)}`; // jshint ignore:line

    return (
      <a
        className={this.props.className}
        href={sendFeedbackHref}
      >
        {this.getIntlMessage('sendFeedback')}
      </a>
    );
  },
});


module.exports = SendFeedbackButton;
