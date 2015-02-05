/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');

var BaremeVisualization = require('./visualizations/bareme-visualization'),
  helpers = require('../helpers'),
  revdispDistribution = require('../../data/revdisp-distribution.json'),
  salDistribution = require('../../data/sal-distribution.json'),
  SituateurVisualization = require('./visualizations/situateur-visualization'),
  WaterfallVisualization = require('./visualizations/waterfall-visualization');


var Visualization = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    columns: React.PropTypes.object.isRequired,
    defaultPropsByVisualizationSlug: React.PropTypes.object.isRequired,
    diffMode: React.PropTypes.bool,
    downloadAttribution: React.PropTypes.string,
    isSimulationInProgress: React.PropTypes.bool,
    labelsFontSize: React.PropTypes.number.isRequired,
    onDownload: React.PropTypes.func.isRequired,
    onSettingsChange: React.PropTypes.func.isRequired,
    onVisualizationChange: React.PropTypes.func.isRequired,
    settings: React.PropTypes.object.isRequired,
    simulationResult: React.PropTypes.any.isRequired,
    testCase: React.PropTypes.object.isRequired,
    visualizationSlug: React.PropTypes.string.isRequired,
  },
  getDefaultProps: function() {
    return {
      downloadAttribution: '© openfisca.fr',
      labelsFontSize: 14,
    };
  },
  handleSettingsChange: function(settings, simulate) {
    this.props.onSettingsChange(this.props.visualizationSlug, settings, simulate);
  },
  render: function() {
    var visualizationComponent;
    if (this.props.visualizationSlug === 'bareme') {
      visualizationComponent = (
        <BaremeVisualization
          baseVariablesTree={this.props.simulationResult.baseValue}
          collapsedVariables={this.props.settings.bareme.collapsedVariables}
          columns={this.props.columns}
          defaultProps={this.props.defaultPropsByVisualizationSlug.bareme}
          diffMode={this.props.diffMode}
          displayBisectrix={this.props.settings.bareme.displayBisectrix}
          displaySettings={this.props.settings.bareme.displaySettings}
          downloadAttribution={this.props.downloadAttribution}
          formatNumber={helpers.formatFrenchNumber}
          isChartFullWidth={this.props.settings.bareme.isChartFullWidth}
          labelsFontSize={this.props.labelsFontSize}
          onDownload={this.props.onDownload}
          onSettingsChange={this.handleSettingsChange}
          onVisualizationChange={this.props.onVisualizationChange}
          testCase={this.props.testCase}
          variablesTree={this.props.simulationResult.value}
          visualizationSlug={this.props.visualizationSlug}
          xAxisVariableCode={this.props.settings.bareme.xAxisVariableCode}
          xMaxValue={this.props.settings.bareme.xMaxValue}
          xMinValue={this.props.settings.bareme.xMinValue}
        />
      );
    } else if (this.props.visualizationSlug === 'situateur-revdisp') {
      visualizationComponent = this.renderSituateur('revdisp');
    } else if (this.props.visualizationSlug === 'situateur-sal') {
      visualizationComponent = this.renderSituateur('sal');
    } else if (this.props.visualizationSlug === 'waterfall') {
      visualizationComponent = (
        <WaterfallVisualization
          baseVariablesTree={this.props.simulationResult.baseValue}
          collapsedVariables={this.props.settings.waterfall.collapsedVariables}
          defaultProps={this.props.defaultPropsByVisualizationSlug.waterfall}
          diffMode={this.props.diffMode}
          displaySettings={this.props.settings.waterfall.displaySettings}
          displaySubtotals={this.props.settings.waterfall.displaySubtotals}
          displayVariablesColors={this.props.settings.waterfall.displayVariablesColors}
          downloadAttribution={this.props.downloadAttribution}
          formatNumber={helpers.formatFrenchNumber}
          isChartFullWidth={this.props.settings.waterfall.isChartFullWidth}
          labelsFontSize={this.props.labelsFontSize}
          onDownload={this.props.onDownload}
          onSettingsChange={this.handleSettingsChange}
          onVisualizationChange={this.props.onVisualizationChange}
          testCase={this.props.testCase}
          variablesTree={this.props.simulationResult.value}
          visualizationSlug={this.props.visualizationSlug}
        />
      );
    }
    return (
      <div>
        {visualizationComponent}
        {
          this.props.isSimulationInProgress && (
            <span
              className="label label-default"
              style={{position: 'absolute', right: 15, top: 0}}
            >
              {this.getIntlMessage('simulationInProgress')}
            </span>
          )
        }
      </div>
    );
  },
  renderSituateur: function(variableName) {
    var value = this.props.simulationResult.value[0].values[0];
    var curveLabel, formatHint, pointLabel, points;
    // TODO translate labels and hints.
    if (variableName === 'revdisp') {
      curveLabel = 'Revenu disponible';
      formatHint = (amount, percent) => `${percent} % des français ont un revenu disponible inférieur à ${amount} €`; // jshint ignore:line
      pointLabel = 'Votre revenu disponible';
      points = revdispDistribution;
    } else if (variableName === 'sal') {
      curveLabel = 'Salaires imposables';
      formatHint = (amount, percent) => `${percent} % des français ont des salaires imposables inférieurs à ${amount} €`; // jshint ignore:line
      pointLabel = 'Vos salaires imposables';
      points = salDistribution;
    }
    return (
      <SituateurVisualization
        curveLabel={curveLabel}
        formatHint={formatHint}
        labelsFontSize={this.props.labelsFontSize}
        onVisualizationChange={this.props.onVisualizationChange}
        pointLabel={pointLabel}
        points={points}
        value={value}
        visualizationSlug={this.props.visualizationSlug}
        xFormatNumber={value => helpers.formatFrenchNumber(value, {fixed: 0})}
        xSnapIntervalValue={5}
        yFormatNumber={helpers.formatFrenchNumber}
        yMaxValue={Math.max(100000, value)}
      />
    );
  },
});

module.exports = Visualization;
