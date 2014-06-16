/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var ChartToolbar = require('./chart-toolbar'),
  TestCaseForm = require('./test-case-form'),
  TestCaseToolbar = require('./test-case-toolbar'),
  webservices = require('../webservices');

var appconfig = global.appconfig;


var DummyChart = React.createClass({
  render: function() {
    return (
      <div>DummyChart</div>
    );
  },
});


var Simulator = React.createClass({
  getInitialState: function() {
    return {
      chart: null,
      isSimulationInProgress: false,
      legislation: null,
      testCase: null,
      year: appconfig.constants.defaultYear,
    };
  },
  componentDidMount: function() {
    webservices.fetchCurrentTestCase(this.handleCurrentTestCaseFetched);
  },
  handleAddEntity: function(entityName) {
    console.log('handleAddEntity', entityName);
  },
  handleChartChange: function(evt) {
    var newValue = evt.target.value;
    var newState = React.addons.update(this.state, {chart: {$set: newValue}});
    this.setState(newState);
  },
  handleCurrentTestCaseFetched: function(currentTestCase) {
    var newState = React.addons.update(this.state, {testCase: {$set: currentTestCase}});
    this.setState(newState);
  },
  handleLegislationChange: function(evt) {
    var newValue = evt.target.value;
    var newState = React.addons.update(this.state, {legislation: {$set: newValue}});
    this.setState(newState);
  },
  handleRepair: function() {
  },
  handleReset: function() {
    this.setState({testCase: null});
  },
  handleSimulate: function() {
    console.log('handleSimulate');
  },
  handleYearChange: function(evt) {
    var newValue = evt.target.valueAsNumber;
    var newState = React.addons.update(this.state, {year: {$set: newValue}});
    this.setState(newState);
  },
  render: function() {
    var dummyChart = <DummyChart />;
    var dummyCharts = [
      {name: 'Test', slug: 'test'},
      {name: 'Test 2', slug: 'test-2'},
    ];
    var dummyLegislations = [];
    var dummyTestCase = {
      individus: [],
      familles: {abcd0123: {nom_famille: 'Foo'}}, // jshint ignore:line
      foyers_fiscaux: {abcd0124: {nom_foyer_fiscal: 'Foo'}}, // jshint ignore:line
      menages: {abcd0125: {nom_menage: 'Foo'}}, // jshint ignore:line
    };
    var testCase = this.state.testCase || dummyTestCase;
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
          <TestCaseForm testCase={testCase} />
        </div>
        <div className="col-sm-8">
          <ChartToolbar
            chart={this.state.chart}
            charts={dummyCharts}
            legislation={this.state.legislation}
            legislations={dummyLegislations}
            onChartChange={this.handleChartChange}
            onLegislationChange={this.handleLegislationChange}
            onYearChange={this.handleYearChange}
            year={this.state.year}
          />
          {dummyChart}
        </div>
      </div>
    );
  }
});

module.exports = Simulator;
