/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');

var BaremeVisualization = require('./visualizations/bareme-visualization'),
  helpers = require('../helpers'),
  JsonVisualization = require('./visualizations/json-visualization'),
  revdispDistribution = require('../../data/revdisp-distribution.json'),
  salDistribution = require('../../data/sal-distribution.json'),
  SituateurVisualization = require('./visualizations/situateur-visualization'),
  WaterfallVisualization = require('./visualizations/waterfall-visualization');

var obj = helpers.obj;


var Visualization = React.createClass({
  propTypes: {
    baremeXMaxValue: React.PropTypes.number.isRequired,
    baremeXMinValue: React.PropTypes.number.isRequired,
    onBaremeXValuesChange: React.PropTypes.func.isRequired,
    simulationResult: React.PropTypes.object.isRequired,
    visualizationPanelWidth: React.PropTypes.number.isRequired,
    visualizationSlug: React.PropTypes.string.isRequired,
  },
  getInitialState: function() {
    return {
      collapsedVariables: {},
    };
  },
  handleVariableToggle: function(variable) {
    console.debug('handleVariableToggle', variable);
    var status = this.state.collapsedVariables[variable.code];
    var newCollapsedVariables = Lazy(this.state.collapsedVariables).assign(obj(variable.code, ! status)).toObject();
    this.setState({collapsedVariables: newCollapsedVariables});
  },
  render: function() {
    var visualizationHeight = this.props.visualizationPanelWidth * 0.8;
    if (this.props.simulationResult.error) {
      return (
        <p className="text-danger">
          Erreur de simulation sur le serveur, veuillez nous excuser.
          L'équipe technique vient d'être prévenue par un email automatique.
        </p>
      );
    } else {
      if (this.props.visualizationSlug === 'json') {
        return <JsonVisualization data={this.props.simulationResult} />;
      } else if (this.props.visualizationSlug.startsWith('situateur-')) {
        var value = this.props.simulationResult[0].values[0];
        var curveLabel, formatHint, pointLabel, points;
        if (this.props.visualizationSlug === 'situateur-revdisp') {
          curveLabel = 'Revenu disponible';
          formatHint = ({amount, percent}) => `${percent} % des français ont un revenu disponible inférieur à ${amount} €`; // jshint ignore:line
          pointLabel = 'Votre revenu disponible';
          points = revdispDistribution;
        } else if (this.props.visualizationSlug === 'situateur-sal') {
          curveLabel = 'Salaires imposables';
          formatHint = ({amount, percent}) => `${percent} % des français ont des salaires imposables inférieurs à ${amount} €`; // jshint ignore:line
          pointLabel = 'Vos salaires imposables';
          points = salDistribution;
        }
        return (
          <SituateurVisualization
            curveLabel={curveLabel}
            formatHint={formatHint}
            height={visualizationHeight}
            pointLabel={pointLabel}
            points={points}
            value={value}
            width={this.props.visualizationPanelWidth}
            xFormatNumber={value => helpers.formatFrenchNumber(value, {fixed: 0})}
            xSnapIntervalValue={5}
            yFormatNumber={helpers.formatFrenchNumber}
            yMaxValue={Math.max(100000, value)}
          />
        );
      } else if (this.props.visualizationSlug === 'bareme') {
        return (
          <BaremeVisualization
            collapsedVariables={this.state.collapsedVariables}
            formatNumber={helpers.formatFrenchNumber}
            height={visualizationHeight}
            onXValuesChange={this.props.onBaremeXValuesChange}
            onVariableToggle={this.handleVariableToggle}
            variablesTree={this.props.simulationResult}
            width={this.props.visualizationPanelWidth}
            xLabel="Revenus d'activité imposables"
            xMaxValue={this.props.baremeXMaxValue}
            xMinValue={this.props.baremeXMinValue}
          />
        );
      } else if (this.props.visualizationSlug === 'cascade') {
        return (
          <WaterfallVisualization
            collapsedVariables={this.state.collapsedVariables}
            formatNumber={helpers.formatFrenchNumber}
            height={visualizationHeight}
            onVariableToggle={this.handleVariableToggle}
            variablesTree={this.props.simulationResult}
            width={this.props.visualizationPanelWidth}
          />
        );
      }
    }
  }
});

module.exports = Visualization;
