/** @jsx React.DOM */
'use strict';

var React = require('react');

var VisualizationSelect = require('./visualization-select'),
  LegislationSelect = require('./legislation-select'),
//  SituationForm = require('./situation-form'),
  YearInput = require('./year-input');


var VisualizationToolbar = React.createClass({
  propTypes: {
    legislation: React.PropTypes.string,
    legislations: React.PropTypes.array,
    onVisualizationChange: React.PropTypes.func.isRequired,
    onLegislationChange: React.PropTypes.func.isRequired,
    onYearChange: React.PropTypes.func.isRequired,
    visualizations: React.PropTypes.array,
    visualizationSlug: React.PropTypes.string,
    year: React.PropTypes.number.isRequired,
  },
  render: function() {
    return (
      <div className="form-inline" role="form">
        {
          this.props.visualizations ?
            <div className="form-group" style={{marginRight: 5}}>
              <VisualizationSelect
                visualizations={this.props.visualizations}
                onChange={this.props.onVisualizationChange}
                value={this.props.visualizationSlug}
              />
            </div>
            : null
        }
        <div className="form-group" style={{marginRight: 5}}>
          <YearInput onChange={this.props.onYearChange} value={this.props.year} />
        </div>
        <div className="form-group" style={{marginRight: 5}}>
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

module.exports = VisualizationToolbar;
