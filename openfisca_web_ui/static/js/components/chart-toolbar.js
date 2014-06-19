/** @jsx React.DOM */
'use strict';

var React = require('react');

var ChartSelect = require('./chart-select'),
  LegislationSelect = require('./legislation-select'),
//  SituationForm = require('./situation-form'),
  YearInput = require('./year-input');


var ChartToolbar = React.createClass({
  propTypes: {
    charts: React.PropTypes.array.isRequired,
    chartSlug: React.PropTypes.string,
    isSimulationInProgress: React.PropTypes.bool.isRequired,
    legislation: React.PropTypes.string,
    legislations: React.PropTypes.array.isRequired,
    onChartChange: React.PropTypes.func.isRequired,
    onLegislationChange: React.PropTypes.func.isRequired,
    onYearChange: React.PropTypes.func.isRequired,
    year: React.PropTypes.number.isRequired,
  },
  render: function() {
    return (
      <div className="form-inline" role="form">
        <div className="form-group" style={{marginRight: 5}}>
          <ChartSelect charts={this.props.charts} onChange={this.props.onChartChange} value={this.props.chartSlug} />
        </div>
        <div className="form-group" style={{marginRight: 5}}>
          <YearInput
            charts={this.props.charts}
            onChange={this.props.onYearChange}
            value={this.props.year}
          />
        </div>
        <div className="form-group" style={{marginRight: 5}}>
          <LegislationSelect
            legislations={this.props.legislations}
            onChange={this.props.onLegislationChange}
            value={this.props.legislation}
          />
        </div>
        {
          this.props.isSimulationInProgress ?
            <span className="label label-default" title="">Simulation</span>
            : null
        }
      </div>
    );
  }
});

module.exports = ChartToolbar;
