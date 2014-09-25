/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react'),
  ReactIntlMixin = require('react-intl');

var BaremeVisualization = require('./visualizations/bareme-visualization'),
  helpers = require('../helpers'),
  JsonVisualization = require('./visualizations/json-visualization'),
  revdispDistribution = require('../../data/revdisp-distribution.json'),
  salDistribution = require('../../data/sal-distribution.json'),
  SituateurVisualization = require('./visualizations/situateur-visualization'),
  WaterfallVisualization = require('./visualizations/waterfall-visualization');

var obj = helpers.obj;


var Visualization = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    baremeXMaxValue: React.PropTypes.number.isRequired,
    baremeXMinValue: React.PropTypes.number.isRequired,
    labelsFontSize: React.PropTypes.number.isRequired,
    onBaremeXValuesChange: React.PropTypes.func.isRequired,
    simulationResult: React.PropTypes.any.isRequired,
    testCase: React.PropTypes.object,
    visualizationSlug: React.PropTypes.string.isRequired,
  },
  getDefaultProps: function() {
    return {
      labelsFontSize: 14,
    };
  },
  getInitialState: function() {
    return {
      collapsedVariables: {},
    };
  },
  handleVariableToggle: function(variable) {
    var status = this.state.collapsedVariables[variable.code];
    var newCollapsedVariables = Lazy(this.state.collapsedVariables).assign(obj(variable.code, ! status)).toObject();
    this.setState({collapsedVariables: newCollapsedVariables});
  },
  render: function() {
    if (this.props.simulationResult.error) {
      return (
        <div className="alert alert-danger" role="alert">
          <h4>{this.getIntlMessage('error')}</h4>
          <p>{this.getIntlMessage('simulationErrorExplanation')}</p>
        </div>

      );
    } else {
      if (this.props.visualizationSlug === 'json') {
        return <JsonVisualization simulationResult={this.props.simulationResult} testCase={this.props.testCase} />;
      } else if (this.props.visualizationSlug.startsWith('situateur-')) {
        var value = this.props.simulationResult[0].values[0];
        var curveLabel, formatHint, pointLabel, points;
        // TODO translate labels and hints.
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
            labelsFontSize={this.props.labelsFontSize}
            pointLabel={pointLabel}
            points={points}
            value={value}
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
            labelsFontSize={this.props.labelsFontSize}
            onVariableToggle={this.handleVariableToggle}
            onXValuesChange={this.props.onBaremeXValuesChange}
            variablesTree={this.props.simulationResult}
            xMaxValue={this.props.baremeXMaxValue}
            xMinValue={this.props.baremeXMinValue}
          />
        );
      } else if (this.props.visualizationSlug === 'cascade') {
        return (
          <WaterfallVisualization
            collapsedVariables={this.state.collapsedVariables}
            formatNumber={helpers.formatFrenchNumber}
            labelsFontSize={this.props.labelsFontSize}
            onVariableToggle={this.handleVariableToggle}
            variablesTree={this.props.simulationResult}
          />
        );
      }
    }
  }
});

module.exports = Visualization;
