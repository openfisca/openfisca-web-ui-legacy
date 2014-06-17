/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  uuid = require('uuid');

var ChartToolbar = require('./chart-toolbar'),
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
        {JSON.stringify(this.props.data)}
      </div>
    );
  },
});


var Simulator = React.createClass({
  getInitialState: function() {
    return {
      chart: null,
      errors: null,
      isSimulationInProgress: false,
      legislationUrl: null,
      simulationResult: null,
      suggestions: null,
      testCase: this.getInitialTestCase(),
      year: appconfig.constants.defaultYear,
    };
  },
  getInitialTestCase: function() {
    var individuId = uuid.v4();
    var individu = {id: individuId, nom_individu: 'Personne 1'}; // jshint ignore:line
    var individus = {};
    individus[individuId] = individu;
    var testCase = {
      familles: null,
      foyers_fiscaux: null, // jshint ignore:line
      individus: individus,
      menages: null,
    };
    return testCase;
  },
  componentDidMount: function() {
    webservices.fetchCurrentTestCase(this.handleCurrentTestCaseFetched, this.handleError);
  },
  handleAddEntity: function(entityName, event) {
    event.preventDefault();
    console.debug('handleAddEntity', entityName);
    var newEntity = {};
    newEntity[uuid.v4()] = {parents: [], enfants: []}; // TODO parametrize roles
    var spec = {testCase: {}};
    spec.testCase[entityName] = {$merge: newEntity};
    var newState = React.addons.update(this.state, spec);
    this.setState(newState);
  },
  handleAddIndividu: function(entityName, roleName, event) {
    event.preventDefault();
    console.debug('handleAddIndividu', entityName, roleName);
  },
  handleChartChange: function(event) {
    var newValue = event.target.value;
    var newState = React.addons.update(this.state, {chart: {$set: newValue}});
    this.setState(newState);
  },
  handleCurrentTestCaseFetched: function(testCase) {
    if (testCase === null) {
      testCase = this.state.testCase;
    }
    this.repairTestCase(testCase);
  },
  handleDeleteEntity: function(event) {
    event.preventDefault();
    console.debug('handleDeleteEntity');
  },
  handleDeleteIndividu: function(event) {
    event.preventDefault();
    console.debug('handleDeleteIndividu');
  },
  handleEditEntity: function(event) {
    event.preventDefault();
    console.debug('handleEditEntity');
  },
  handleEditIndividu: function(event) {
    event.preventDefault();
    console.debug('handleEditIndividu');
  },
  handleError: function(error) {
    console.error(error.message);
  },
  handleLegislationChange: function(event) {
    var newValue = event.target.value;
    var newState = React.addons.update(this.state, {legislationUrl: {$set: newValue}});
    this.setState(newState);
  },
  handleMoveIndividu: function(event) {
    event.preventDefault();
    console.debug('handleMoveIndividu');
  },
  handleRepair: function(event) {
    event.preventDefault();
    this.repairTestCase(this.state.testCase);
  },
  handleRepaired: function(data) {
    var newState = React.addons.update(this.state, {
      errors: {$set: data.errors},
      suggestions: {$set: data.suggestions},
      testCase: {$set: data.testCase},
    });
    this.setState(newState);
  },
  handleReset: function(event) {
    event.preventDefault();
    if (confirm('Réinitialiser la situation ?')) { // jshint ignore:line
      var initialTestCase = this.getInitialTestCase();
      this.repairTestCase(initialTestCase);
    }
  },
  handleSimulate: function() {
    webservices.simulate(this.state.legislationUrl, this.state.testCase, this.state.year, this.handleSimulated,
      this.handleError);
  },
  handleSimulated: function(simulationResult) {
    console.debug('handleSimulated', simulationResult);
    var newState = React.addons.update(this.state, {simulationResult: {$set: simulationResult}});
    this.setState(newState);
  },
  handleYearChange: function(event) {
    var newValue = event.target.valueAsNumber;
    var newState = React.addons.update(this.state, {year: {$set: newValue}});
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
          <TestCaseForm
            errors={this.state.errors}
            onAddIndividu={this.handleAddIndividu}
            onDeleteEntity={this.handleDeleteEntity}
            onDeleteIndividu={this.handleDeleteIndividu}
            onEditEntity={this.handleEditEntity}
            onEditIndividu={this.handleEditIndividu}
            onMoveIndividu={this.handleMoveIndividu}
            suggestions={this.state.suggestions}
            testCase={this.state.testCase}
          />
        </div>
        <div className="col-sm-8">
          <ChartToolbar
            chart={this.state.chart}
            charts={dummyCharts}
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
            <DummyChart data={this.state.simulationResult} /> :
            <p>No result</p>
          }
        </div>
      </div>
    );
  },
  repairTestCase: function(testCase) {
    webservices.repairTestCase(testCase, this.state.year, this.handleRepaired, this.handleError);
  },
});

module.exports = Simulator;
