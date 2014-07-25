/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react');


var appconfig = global.appconfig;


var AcceptCookiesModal = React.createClass({
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
                  Conditions générales d'utilisation <small>(CGU)</small>
                </h4>
              </div>
              <div className="modal-body">
                <p>
                  OpenFisca est un logiciel libre de simulation du système socio-fiscal français. Il permet de
                  visualiser simplement un grand nombre de prestations sociales et d'impôts payés par les
                  ménages, et de simuler l'impact de réformes sur le budget des ménages. Il s'agit d'un outil
                  à vocation pédagogique pour aider les citoyens à mieux comprendre le système socio-fiscal
                  français.
                </p>
                <p>
                  La simulation est effectuée à partir des textes juridiques applicables et des éléments
                  saisis en ligne. Elle ne constitue en aucune façon une déclaration de revenus.
                </p>
                <p>
                  Les montants, obtenus à partir des
                  <strong>
                    informations inscrites sous votre seule
                    responsabilité, n'ont qu'une valeur indicative
                  </strong>.
                  Ainsi, les montants de vos impôts calculés lors de votre déclaration de revenus
                  peuvent être différents.
                </p>
                <div className="checkbox">
                  <label>
                    <input
                      checked={this.state.acceptCheckboxChecked}
                      name="accept-checkbox"
                      onChange={this.handleAcceptCheckboxChange}
                      type="checkbox"
                    />
                    J'ai pris connaissance des informations ci-dessus.
                  </label>
                </div>
                <p className="cookie-text">Pour fonctionner, ce site a besoin d'utiliser des cookies.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  disabled={! this.state.acceptCheckboxChecked}
                  name="accept"
                  type="submit">
                  <span className="glyphicon glyphicon-ok"></span> Accepter
                </button>
                <a className="btn btn-danger" href={appconfig['www.url']}>
                  <span className="glyphicon glyphicon-remove"></span> Refuser
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
