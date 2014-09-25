/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');

var VisualizationSelect = require('./visualization-select'),
  YearInput = require('./year-input');


var VisualizationToolbar = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    isSimulationInProgress: React.PropTypes.bool,
    onVisualizationChange: React.PropTypes.func.isRequired,
    onYearChange: React.PropTypes.func.isRequired,
    visualizationSlug: React.PropTypes.string,
    year: React.PropTypes.number.isRequired,
  },
  render: function() {
    return (
      <div className="form-inline" role="form">
        <div className="form-group" style={{marginRight: 5}}>
          <VisualizationSelect onChange={this.props.onVisualizationChange} value={this.props.visualizationSlug} />
        </div>
        <div className="form-group" style={{marginRight: 5}}>
          <YearInput onChange={this.props.onYearChange} value={this.props.year} />
        </div>
        {
          this.props.isSimulationInProgress && (
            <span className="label label-default visible-xs-inline">
              {this.getIntlMessage('simulationInProgress')}
            </span>
          )
        }
      </div>
    );
  }
});

module.exports = VisualizationToolbar;
