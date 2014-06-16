/** @jsx React.DOM */
'use strict';

var React = require('react');

var ChartSelect = require('./chart-select'),
  LegislationSelect = require('./legislation-select'),
//  SituationForm = require('./situation-form'),
  YearInput = require('./year-input');


var ChartToolbar = React.createClass({
  propTypes: {
    chart: React.PropTypes.string,
    charts: React.PropTypes.array.isRequired,
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
        <div className="form-group">
          <ChartSelect charts={this.props.charts} onChange={this.props.onChartChange} value={this.props.chart} />
        </div>
        <div className="form-group">
          <YearInput
            charts={this.props.charts}
            onChange={this.props.onYearChange}
            value={this.props.year}
          />
        </div>
        <div className="form-group">
          <LegislationSelect
            legislations={this.props.legislations}
            onChange={this.props.onLegislationChange}
            value={this.props.legislation}
          />
        </div>
      </div>
    );
  }
});

module.exports = ChartToolbar;
