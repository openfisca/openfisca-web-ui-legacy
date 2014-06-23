/** @jsx React.DOM */
'use strict';

var React = require('react');


var LegislationSelect = React.createClass({
  propTypes: {
    legislations: React.PropTypes.array,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
  },
  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },
  render: function() {
    var options = <option key="default-legislation" value="">Législation par défaut</option>;
    if (this.props.legislations && this.props.legislations.length) {
      options = options.concat(this.props.legislations.map(function(legislation) {
        return <option key={legislation.url} value={legislation.url}>{legislation.title}</option>;
      }));
    }
    return (
      <select className="form-control" onChange={this.handleChange} value={this.props.value}>
        {options}
      </select>
    );
  }
});

module.exports = LegislationSelect;
