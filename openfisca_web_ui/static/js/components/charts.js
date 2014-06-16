/** @jsx React.DOM */
'use strict';

var React = require('react');

var ChartSelect = require('./chart-select');

var appconfig = global.appconfig;


var enableLocatingChart = appconfig.enabledModules.locatingChart;

var Charts = React.createClass({
  render: function() {
    var charts = [], testCases = [], legislations = [], displaySaveButton;
    var options = charts.map(function(chart) {
      return <option value={chart.slug}>{chart.title}</option>;
    });
    var testCasesFormGroupOptions = testCases.map(function(testCase) {
      return <option value={testCase.slug}>{testCase.title}</option>;
    });
    var testCasesFormGroup =
<div className="form-group">
  <select className="form-control" name="test_case" title="Simulation">
    {testCasesFormGroupOptions}
  </select>
</div>;
    var saveButton = displaySaveButton ?
<div className="form-group">
  <button className="btn btn-primary sign-in">Enregistrer</button>
</div>
      : null;
    return (
      <div>
        <div className="chart-wrapper"></div>
        <hr/>
        <div className="form-inline pull-right" role="form">
          {saveButton}
          <div className="form-group">
            <button className="btn btn-default" data-toggle="modal" data-target="#export-modal">
              Exporter
            </button>
          </div>
        </div>
        <div className="alert alert-info overlay"></div>
      </div>
    );
  }
});

module.exports = Charts;
