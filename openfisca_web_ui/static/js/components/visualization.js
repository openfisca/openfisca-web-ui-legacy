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
    downloadAttribution: React.PropTypes.string,
    labelsFontSize: React.PropTypes.number.isRequired,
    onDownload: React.PropTypes.func.isRequired,
    onReformChange: React.PropTypes.func.isRequired,
    onSettingsChange: React.PropTypes.func.isRequired,
    onVisualizationChange: React.PropTypes.func.isRequired,
    reform: React.PropTypes.string,
    settings: React.PropTypes.object.isRequired,
    simulationResult: React.PropTypes.any.isRequired,
    visualizationSlug: React.PropTypes.string.isRequired,
  },
  getDefaultProps: function() {
    return {
      downloadAttribution: '© openfisca.fr',
      labelsFontSize: 14,
    };
  },
  handleSettingsChange: function(settings, simulate = false) {
    this.props.onSettingsChange(this.props.visualizationSlug, settings, simulate);
  },
  render: function() {
    var isDiff = this.props.reform === 'plf2015-diff';
    switch (this.props.visualizationSlug) {
      case 'bareme':
        return (
          <BaremeVisualization
            collapsedVariables={this.props.settings.bareme.collapsedVariables}
            columns={this.props.columns}
            downloadAttribution={this.props.downloadAttribution}
            formatNumber={helpers.formatFrenchNumber}
            isChartFullWidth={this.props.settings.bareme.isChartFullWidth}
            labelsFontSize={this.props.labelsFontSize}
            onDownload={this.props.onDownload}
            onReformChange={this.props.onReformChange}
            onSettingsChange={this.handleSettingsChange}
            onVisualizationChange={this.props.onVisualizationChange}
            onXValuesChange={(xMinValue, xMaxValue) => this.handleSettingsChange({xMinValue, xMaxValue}, true)}
            reform={this.props.reform}
            variablesTree={this.props.simulationResult}
            visualizationSlug={this.props.visualizationSlug}
            xAxisVariableCode={this.props.settings.bareme.xAxisVariableCode}
            xMaxValue={this.props.settings.bareme.xMaxValue}
            xMinValue={this.props.settings.bareme.xMinValue}
          />
        );
      case 'situateur-revdisp':
        return this.renderSituateur('revdisp');
      case 'situateur-sal':
        return this.renderSituateur('sal');
      case 'waterfall':
        return (
          <WaterfallVisualization
            collapsedVariables={this.props.settings.waterfall.collapsedVariables}
            diff={isDiff}
            displaySubtotals={this.props.settings.waterfall.displaySubtotals}
            displayVariablesColors={this.props.settings.waterfall.displayVariablesColors}
            downloadAttribution={this.props.downloadAttribution}
            formatNumber={helpers.formatFrenchNumber}
            isChartFullWidth={this.props.settings.waterfall.isChartFullWidth}
            labelsFontSize={this.props.labelsFontSize}
            onDownload={this.props.onDownload}
            onReformChange={this.props.onReformChange}
            onSettingsChange={this.handleSettingsChange}
            onVisualizationChange={this.props.onVisualizationChange}
            reform={this.props.reform}
            valuesOffset={isDiff ? null : (this.props.reform ? 1 : 0)}
            variablesTree={this.props.simulationResult}
            visualizationSlug={this.props.visualizationSlug}
          />
        );
    }
  },
  renderSituateur: function(variableName) {
    var value = this.props.simulationResult[0].values[0];
    var curveLabel, formatHint, pointLabel, points;
    // TODO translate labels and hints.
    if (variableName === 'revdisp') {
      curveLabel = 'Revenu disponible';
      formatHint = ({amount, percent}) => `${percent} % des français ont un revenu disponible inférieur à ${amount} €`; // jshint ignore:line
      pointLabel = 'Votre revenu disponible';
      points = revdispDistribution;
    } else if (variableName === 'sal') {
      curveLabel = 'Salaires imposables';
      formatHint = ({amount, percent}) => `${percent} % des français ont des salaires imposables inférieurs à ${amount} €`; // jshint ignore:line
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
