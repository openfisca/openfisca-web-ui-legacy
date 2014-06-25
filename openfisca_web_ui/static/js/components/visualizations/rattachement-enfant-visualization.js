/** @jsx React.DOM */
'use strict';

var mapObject = require('map-object'),
  React = require('react/addons'),
  _ = require('underscore'),
  uuid = require('uuid');

var models = require('../../models');


var RattachementEnfantVisualization = React.createClass({
  propTypes: {
    legislationUrl: React.PropTypes.string,
    localState: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    onSimulate: React.PropTypes.func.isRequired,
    simulationResult: React.PropTypes.number,
    testCase: React.PropTypes.object.isRequired,
    year: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function () {
    return {
      localState: {},
    };
  },
  getValidChildren: function () {
    var children = {};
    mapObject(this.props.testCase.individus, function(individu, individuId) {
      if (models.TestCase.hasRole(individuId, 'familles', 'enfants', this.props.testCase)) {
        children[individuId] = individu;
      }
    }, this);
    return children;
  },
  handleChange: function (childId, fieldName, event) {
    console.debug('RattachementEnfantVisualization.handleChange', fieldName, event);
    var value;
    if (fieldName === 'alr') {
      value = event.target.valueAsNumber;
    } else if (fieldName === 'detached') {
      value = event.target.value;
    }
    var spec = {};
    var valueSpec = {};
    valueSpec[fieldName] = value;
    spec[childId] = this.props.localState[childId] ? {$merge: valueSpec} : {$set: valueSpec};
    var newLocalState = React.addons.update(this.props.localState, spec);
    this.props.onChange(newLocalState);
  },
  handleSubmit: function(event) {
    event.preventDefault();
    var localState = this.props.localState;
    var newTestCase = this.props.testCase;
    var testCaseSpec;
    mapObject(this.getValidChildren(), function(child, childId) {
      if (localState[childId] && localState[childId].detached) {
        var foyerFiscalData = models.TestCase.findEntity(childId, 'foyers_fiscaux', 'personnes_a_charge',
          newTestCase);
        if (foyerFiscalData) {
          testCaseSpec = {};
          var foyerFiscal = foyerFiscalData.entity;
          var foyerFiscalId = foyerFiscalData.id;
          var f6el = 'f6el' in foyerFiscal ? foyerFiscal.f6el : 0;
          var foyerFiscalSpec = {};
          var alr = localState[childId].alr;
          if ( ! ('individus' in testCaseSpec)) {
            testCaseSpec.individus = {};
          }
          if ( ! (childId in testCaseSpec.individus)) {
            testCaseSpec.individus[childId] = {};
          }
          testCaseSpec.individus[childId].alr = {$set: alr};
          foyerFiscalSpec.f6el = {$set: f6el + alr};
          var newFoyerFiscal = React.addons.update(foyerFiscal, foyerFiscalSpec);
          if ( ! ('foyers_fiscaux' in testCaseSpec)) {
            testCaseSpec.foyers_fiscaux = {};
          }
          testCaseSpec.foyers_fiscaux[foyerFiscalId] = {$set: newFoyerFiscal};
          newTestCase = React.addons.update(newTestCase, testCaseSpec);
        }
      }
    }, this);
    mapObject(this.getValidChildren(), function(child, childId) {
      if (localState[childId] && localState[childId].detached) {
        var familleData = models.TestCase.findEntity(childId, 'familles', 'enfants',
          newTestCase);
        if (familleData) {
          testCaseSpec = {};
          var famille = familleData.entity;
          var familleId = familleData.id;
          var familleSpec = {enfants: {$set: _.without(famille.enfants, childId)}};
          var newFamille = React.addons.update(famille, familleSpec);
          if ( ! ('familles' in testCaseSpec)) {
            testCaseSpec.familles = {};
          }
          testCaseSpec.familles[familleId] = {$set: newFamille};
          var secondFamilleId = uuid.v4();
          testCaseSpec.familles[secondFamilleId] = {$set: {parents: [childId]}};
          newTestCase = React.addons.update(newTestCase, testCaseSpec);
        }

        var foyerFiscalData = models.TestCase.findEntity(childId, 'foyers_fiscaux', 'personnes_a_charge',
          newTestCase);
        if (foyerFiscalData) {
          var testCaseSpec = {};
          var foyerFiscal = foyerFiscalData.entity;
          var foyerFiscalId = foyerFiscalData.id;
          var foyerFiscalSpec = {personnes_a_charge: {$set: _.without(foyerFiscal.personnes_a_charge, childId)}};
          var newFoyerFiscal = React.addons.update(foyerFiscal, foyerFiscalSpec);
          if ( ! ('foyers_fiscaux' in testCaseSpec)) {
            testCaseSpec.foyers_fiscaux = {};
          }
          testCaseSpec.foyers_fiscaux[foyerFiscalId] = {$set: newFoyerFiscal};
          var secondFoyerFiscalId = uuid.v4();
          testCaseSpec.foyers_fiscaux[secondFoyerFiscalId] = {$set: {declarants: [childId]}};
          newTestCase = React.addons.update(newTestCase, testCaseSpec);
        }
      }
    }, this);
    this.props.onSimulate(this.props.legislationUrl, newTestCase, this.props.year);
  },
  render: function() {
    return (
      <div>
        <form onSubmit={this.handleSubmit} role="form">
          <h1>Enfants</h1>
          {
            mapObject(this.getValidChildren(), function(child, childId) {
              return (
                <div key={childId}>
                  <h2>{child.nom_individu /* jshint ignore:line */}</h2>
                  <p>
                    <input
                      id={childId + '-detached'}
                      onChange={this.handleChange.bind(null, childId, 'detached')}
                      type="checkbox"
                      value={(this.props.localState[childId] || {}).detached}
                    />
                    <label htmlFor={childId + '-detached'}>Détaché</label>
                  </p>
                  <p>
                    <label htmlFor={childId + '-pension'}>Montant de la pension</label>
                    <input
                      id={childId + '-pension'}
                      onChange={this.handleChange.bind(null, childId, 'alr')}
                      type="number"
                      value={(this.props.localState[childId] || {}).alr}
                    />
                  </p>
                </div>
              );
            }, this)
          }
          <button className="btn btn-primary" type="submit">Simuler</button>
        </form>
        {this.props.simulationResult && <h1>Revenu disponible : {this.props.simulationResult.toFixed(0)} €</h1>}
      </div>
    );
  },
});

module.exports = RattachementEnfantVisualization;
