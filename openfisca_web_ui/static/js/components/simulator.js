/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

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
  componentDidMount: function() {
    webservices.fetchCurrentTestCase(this.handleCurrentTestCaseFetched);
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
  handleAddEntity: function(kind) {
    console.debug('handleAddEntity', kind);
    var newEntities = models.TestCase.createEntities(kind);
    var spec = {testCase: {}};
    spec.testCase[kind] = {$merge: newEntities};
    var newState = React.addons.update(this.state, spec);
    this.setState(newState);
  },
  handleAddIndividuInEntity: function(kind, id, role) {
    console.debug('handleAddIndividuInEntity', kind, id, role);
  },
  handleChartChange: function(slug) {
    var newState = React.addons.update(this.state, {chartSlug: {$set: slug}});
    this.setState(newState);
  },
  handleCurrentTestCaseFetched: function(data) {
    if (data && data.error) {
      console.error(data.error.message);
      var newState = React.addons.update(this.state, {testCase: {$set: null}});
      this.setState(newState);
    } else {
      this.repairTestCase(data || models.TestCase.getInitialTestCase());
    }
  },
  handleDeleteEntity: function(kind, id) {
    console.debug('handleDeleteEntity', kind, id);
    var entity = this.state.testCase[kind][id];
    var entityLabel = models.TestCase.getEntityLabel(kind, entity);
    var message = 'Supprimer ' + entityLabel + ' ?'; // jshint ignore:line
    if (confirm(message)) {
      TestCase.deleteEntity(kind, id);
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
    this.setState(newState);
  },
  handleMoveIndividu: function(id) {
    console.debug('handleMoveIndividu', id);
  },
  handleRepair: function() {
    this.repairTestCase(this.state.testCase);
  },
  handleRepairCompleted: function(data) {
    console.debug('handleRepairCompleted', data);
    var newState = React.addons.update(this.state, {
      errors: {$set: data.errors},
      suggestions: {$set: data.suggestions},
      testCase: {$set: data.testCase},
    });
    this.setState(newState);
  },
  handleReset: function() {
    if (confirm('Réinitialiser la situation ?')) { // jshint ignore:line
      var initialTestCase = models.TestCase.getInitialTestCase();
      this.repairTestCase(initialTestCase);
    }
  },
  handleSimulate: function() {
    webservices.simulate(this.state.legislationUrl, this.state.testCase, this.state.year, this.handleSimulateCompleted);
  },
  handleSimulateCompleted: function(data) {
    console.debug('handleSimulateCompleted', data);
    var spec = {
      errors: {$set: data.error ? data.error : null},
      simulationResult: {$set: data.error ? null : data},
    };
    var newState = React.addons.update(this.state, spec);
    this.setState(newState);
  },
  handleYearChange: function(year) {
    var newState = React.addons.update(this.state, {year: {$set: year}});
    this.setState(newState);
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
            onAddEntity={this.handleAddEntity}
            onReset={this.handleReset}
            onRepair={this.handleRepair}
            onSimulate={this.handleSimulate}
          />
          <hr/>
          {
            this.state.testCase ?
              <TestCaseForm
                errors={this.state.errors}
                onAddIndividuInEntity={this.handleAddIndividuInEntity}
                onDeleteEntity={this.handleDeleteEntity}
                onDeleteIndividu={this.handleDeleteIndividu}
                onEditEntity={this.handleEditEntity}
                onEditIndividu={this.handleEditIndividu}
                onMoveIndividu={this.handleMoveIndividu}
                suggestions={this.state.suggestions}
                testCase={this.state.testCase}
              /> :
              null
          }
        </div>
        <div className="col-sm-8">
          <ChartToolbar
            charts={dummyCharts}
            chartSlug={this.state.chartSlug}
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
            <DummyChart data={this.state.simulationResult} /> : (
              this.state.errors ?
              <p>Erreurs dans le formulaire</p> :
              <p>No result</p>
            )
          }
        </div>
      </div>
    );
  },
  repairTestCase: function(testCase) {
    webservices.repairTestCase(testCase, this.state.year, this.handleRepairCompleted);
  },
});

module.exports = Simulator;
