/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');

var VisualizationSelect = require('./visualization-select'),
  YearInput = require('./year-input');

var cx = React.addons.classSet;


var VisualizationToolbar = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    errors: React.PropTypes.object,
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
        <div className={cx({
          'form-group': true,
          'has-error': this.props.errors && this.props.errors.date,
        })} style={{marginRight: 5}}>
          <YearInput
            error={this.props.errors && this.props.errors.date}
            onChange={this.props.onYearChange}
            value={this.props.year}
          />
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
