/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  uuid = require('uuid');

var ChartToolbar = require('./chart-toolbar'),
  models = require('../models'),
  TestCaseForm = require('./test-case-form'),
  TestCaseToolbar = require('./test-case-toolbar'),
  webservices = require('../webservices');

var appconfig = global.appconfig;


var DummyChart = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <div>
        <h1>DummyChart</h1>
        <pre>{JSON.stringify(this.props.data, null, 2)}</pre>
      </div>
    );
  },
});


var Simulator = React.createClass({
  componentWillMount: function() {
    webservices.fetchCurrentTestCase(this.currentTestCaseFetched);
  },
  currentTestCaseFetched: function(data) {
    console.debug('currentTestCaseFetched', data);
    if (data && data.error) {
      console.error(data.error.message);
      var newState = React.addons.update(this.state, {testCase: {$set: null}});
      this.setState(newState);
    } else {
      this.repair(data || models.TestCase.getInitialTestCase());
    }
  },
  currentTestCaseSaved: function(data) {
    console.debug('currentTestCaseSaved', data);
  },
  getInitialState: function() {
    return {
      chartSlug: null,
      errors: null,
      isSimulationInProgress: false,
      legislationUrl: null,
      simulationResult: null,
      suggestions: null,
      testCase: null,
      year: appconfig.constants.defaultYear,
    };
  },
  handleChartChange: function(slug) {
    var newState = React.addons.update(this.state, {chartSlug: {$set: slug}});
    this.setState(newState, function() {
      this.simulate();
    });
  },
  handleCreateEntity: function(kind) {
    console.debug('handleCreateEntity', kind);
    var newEntity = models.TestCase.createEntity(kind, this.state.testCase);
    var newEntities = {};
    newEntities[uuid.v4()] = newEntity;
    var spec = {testCase: {}};
    spec.testCase[kind] = {$merge: newEntities};
    var newState = React.addons.update(this.state, spec);
    this.setState(newState, function() {
      this.repair();
    });
  },
  handleCreateIndividuInEntity: function(kind, id, role) {
    console.debug('handleCreateIndividuInEntity', kind, id, role);
    var newIndividu = models.TestCase.createIndividu(this.state.testCase);
    var newIndividus = {};
    var newIndividuId = uuid.v4();
    newIndividus[newIndividuId] = newIndividu;
    var spec = {};
    spec.individus = {$merge: newIndividus};
    var newTestCase = React.addons.update(this.state.testCase, spec);
    newTestCase = models.TestCase.withIndividuInEntity(newIndividuId, kind, id, role, newTestCase);
    var newState = React.addons.update(this.state, {testCase: {$set: newTestCase}});
    this.setState(newState, function() {
      this.repair();
    });
  },
  handleDeleteEntity: function(kind, id) {
    console.debug('handleDeleteEntity', kind, id);
    var entity = this.state.testCase[kind][id];
    var entityLabel = models.TestCase.getEntityLabel(kind, entity);
    var message = 'Supprimer ' + entityLabel + ' ?'; // jshint ignore:line
    if (confirm(message)) {
      var newTestCase = models.TestCase.withoutEntity(kind, id, this.state.testCase);
      var newState = React.addons.update(this.state, {testCase: {$set: newTestCase}});
      this.setState(newState);
    }
  },
  handleDeleteIndividu: function(id) {
    console.debug('handleDeleteIndividu', id);
    var message = 'Supprimer ' + this.state.testCase.individus[id].nom_individu + ' ?'; // jshint ignore:line
    if (confirm(message)) {
      var newTestCase = models.TestCase.withoutIndividu(id, this.state.testCase);
      var newState = React.addons.update(this.state, {testCase: {$set: newTestCase}});
      this.setState(newState);
    }
  },
  handleEditEntity: function(kind, id) {
    console.debug('handleEditEntity', kind, id);
  },
  handleEditIndividu: function(id) {
    console.debug('handleEditIndividu', id);
  },
  handleLegislationChange: function(legislationUrl) {
    var newState = React.addons.update(this.state, {legislationUrl: {$set: legislationUrl}});
    this.setState(newState, function() {
      this.simulate();
    });
  },
  handleMoveIndividu: function(id) {
    console.debug('handleMoveIndividu', id);
  },
  handleRepair: function() {
    console.debug('handleRepair');
    this.repair();
  },
  handleReset: function() {
    console.debug('handleReset');
    if (confirm('Réinitialiser la situation ?')) { // jshint ignore:line
      var initialTestCase = models.TestCase.getInitialTestCase();
      this.repair(initialTestCase);
    }
  },
  handleYearChange: function(year) {
    console.debug('handleYearChange', year);
    var newState = React.addons.update(this.state, {year: {$set: year}});
    this.setState(newState, function() {
      this.simulate();
    });
  },
  render: function() {
    var dummyCharts = [
      {name: 'Test', slug: 'test'},
      {name: 'Test 2', slug: 'test-2'},
    ];
    var dummyLegislations = [];
    return (
      <div className="row">
        <div className="col-sm-4">
          <TestCaseToolbar
            isSimulationInProgress={this.state.isSimulationInProgress}
            onCreateEntity={this.handleCreateEntity}
            onReset={this.handleReset}
            onRepair={this.handleRepair}
            onSimulate={this.simulate}
          />
          <hr/>
          {
            this.state.testCase ?
              <TestCaseForm
                errors={this.state.errors}
                onCreateIndividuInEntity={this.handleCreateIndividuInEntity}
                onDeleteEntity={this.handleDeleteEntity}
                onDeleteIndividu={this.handleDeleteIndividu}
                onEditEntity={this.handleEditEntity}
                onEditIndividu={this.handleEditIndividu}
                onMoveIndividu={this.handleMoveIndividu}
                suggestions={this.state.suggestions}
                testCase={this.state.testCase}
              />
              : null
          }
        </div>
        <div className="col-sm-8">
          <ChartToolbar
            charts={dummyCharts}
            chartSlug={this.state.chartSlug}
            isSimulationInProgress={this.state.isSimulationInProgress}
            legislation={this.state.legislationUrl}
            legislations={dummyLegislations}
            onChartChange={this.handleChartChange}
            onLegislationChange={this.handleLegislationChange}
            onYearChange={this.handleYearChange}
            year={this.state.year}
          />
          <hr/>
          {
            this.state.simulationResult ?
              <DummyChart data={this.state.simulationResult} />
              : (
                this.state.errors ?
                  <p>Erreurs dans le formulaire</p> :
                  <p>No result</p>
              )
          }
        </div>
      </div>
    );
  },
  repair: function(testCase) {
    console.debug('repair', testCase);
    webservices.repair(testCase || this.state.testCase, this.state.year, this.repairCompleted);
  },
  repairCompleted: function(data) {
    console.debug('repairCompleted', data);
    var errors = data.errors,
      suggestions = data.suggestions,
      testCase = data.testCase;
    var spec = {
      errors: {$set: errors},
      suggestions: {$set: suggestions},
    };
    if (errors) {
      spec.simulationResult = {$set: null};
    } else {
      if (testCase) {
        testCase = models.TestCase.withEntitiesNamesFilled(testCase);
      }
      spec.testCase = {$set: testCase};
    }
    var newState = React.addons.update(this.state, spec);
    this.setState(newState, function() {
      if ( ! this.state.errors) {
        this.simulate();
      }
    });
  },
  simulate: function() {
    console.debug('simulate');
    webservices.saveCurrentTestCase(this.state.testCase, this.currentTestCaseSaved);
    var newState = React.addons.update(this.state, {isSimulationInProgress: {$set: true}});
    this.setState(newState, function() {
      webservices.simulate(this.state.legislationUrl, this.state.testCase, this.state.year,
        this.simulationCompleted);
    });
  },
  simulationCompleted: function(data) {
    console.debug('simulationCompleted', data);
    var spec = {
      errors: {$set: data.error ? data.error : null},
      isSimulationInProgress: {$set: false},
      simulationResult: {$set: data.error ? null : data},
    };
    var newState = React.addons.update(this.state, spec);
    this.setState(newState);
  },
});

module.exports = Simulator;
