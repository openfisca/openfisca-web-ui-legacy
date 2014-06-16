/** @jsx React.DOM */
'use strict';

var mapObject = require('map-object'),
  React = require('react');

var Famille = require('./famille'),
  FoyerFiscal = require('./foyer-fiscal'),
  Menage = require('./menage');


var TestCaseForm = React.createClass({
  propTypes: {
    testCase: React.PropTypes.object.isRequired
  },
  getEntities: function(entityName) {
    return this.props.testCase[entityName] || {};
  },
  render: function() {
    var familles = mapObject(this.getEntities('familles'), function(famille, familleId) {
      return <Famille key={familleId} value={famille} />;
    });
    var foyersFiscaux = mapObject(this.getEntities('foyers_fiscaux'), function(foyerFiscal, foyerFiscalId) {
      return <FoyerFiscal key={foyerFiscalId} value={foyerFiscal} />;
    });
    var menages = mapObject(this.getEntities('menages'), function(menage, menageId) {
      return <Menage key={menageId} value={menage} />;
    });
    return (
      <div>
        {familles}
        {foyersFiscaux}
        {menages}
      </div>
    );
  }
});

module.exports = TestCaseForm;
