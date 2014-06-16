/** @jsx React.DOM */
'use strict';

var React = require('react');


var LegislationSelect = React.createClass({
  propTypes: {
    legislations: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
  },
  render: function() {
    var options = this.props.legislations.map(function(legislation) {
      return <option key={legislation.url} value={legislation.url}>{legislation.title}</option>;
    });
    return (
      <select className="form-control" onChange={this.props.onChange} value={this.props.value}>
        <option key="default-legislation" value="">Législation par défaut</option>
        {options}
      </select>
    );
  }
});

module.exports = LegislationSelect;
