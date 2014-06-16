/** @jsx React.DOM */
'use strict';

var React = require('react');


var ChartSelect = React.createClass({
  propTypes: {
    charts: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
  },
  render: function() {
    var options = this.props.charts.map(function(chart) {
      return <option key={chart.slug} value={chart.slug}>{chart.name}</option>;
    });
    return (
      <select className="form-control" onChange={this.props.onChange} value={this.props.value}>
        {options}
      </select>
    );
  }
});

module.exports = ChartSelect;
