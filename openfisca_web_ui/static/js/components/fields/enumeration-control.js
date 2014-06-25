/** @jsx React.DOM */
'use strict';

var mapObject = require('map-object'),
  React = require('react');

var SuggestionGlyphicon = require('./suggestion-glyphicon');


var EnumerationControl = React.createClass({
  propTypes: {
    default: React.PropTypes.string,
    error: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    labels: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    value: React.PropTypes.string,
  },
  render: function() {
    var select = (
      <select
        className="form-control"
        id={this.props.name}
        onChange={this.props.onChange}
        value={this.props.value}>
        <option value="">Non renseigné ({
          this.props.suggestion ?
            'valeur suggérée : ' + this.props.labels[this.props.suggestion] : // jshint ignore:line
            'valeur par défaut : ' + this.props.labels[this.props.default] // jshint ignore:line
        })</option>
        {
          mapObject(this.props.labels, function(label, labelId) {
            return <option key={'label-' + labelId} value={labelId}>{label}</option>;
          })
        }
      </select>
    );
    return (
      <div>
        <label className="control-label" htmlFor={this.props.name}>{this.props.label}</label>
        {
          this.props.suggestion && ! this.props.error ? (
            <div className="input-group">
              {select}
              <span className="input-group-addon">
                <SuggestionGlyphicon />
              </span>
            </div>
          ) : select
        }
      </div>
    );
  }
});

module.exports = EnumerationControl;
