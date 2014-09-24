/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react'),
  {Typeahead} = require('react-typeahead');

var CerfaField = require('./cerfa-field');


var TypeaheadControl = React.createClass({
  propTypes: {
    autocomplete: React.PropTypes.func.isRequired,
    cerfaField: React.PropTypes.any,
    default: React.PropTypes.string,
    displayedValue:  React.PropTypes.string,
    error: React.PropTypes.string,
    label: React.PropTypes.component.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    required: React.PropTypes.bool,
    suggestion: React.PropTypes.string,
    suggestionIcon: React.PropTypes.component,
    value: React.PropTypes.string,
  },
  handleKeyDown: function(a,b,c) {
    debugger
  },
  handleOptionSelected: function(suggestion) {
    this.props.onChange({
      displayedValue: suggestion.main_postal_distribution,  // jshint ignore:line
      value: suggestion.code,
    });
  },
  render: function() {
    return (
      <div>
        {this.props.label}
        {! this.props.error && this.props.suggestion && this.props.suggestionIcon}
        <Typeahead
          className="topcoat-list"
          customClasses={{
            input: 'form-control',
            results: "topcoat-list__container",
            listItem: "topcoat-list__item",
          }}
          defaultValue={this.props.value}
          onKeyDown={this.handleKeyDown}
          onOptionSelected={this.handleOptionSelected}
          options={['aaaa', 'bbbbbb', 'src']}
          placeholder={this.props.suggestion || this.props.default}
        />
        {
          this.props.cerfaField && (
            <div className='col-md-8'>
              <CerfaField value={this.props.cerfaField} />
            </div>
          )
        }
      </div>
    );
  },
});

module.exports = TypeaheadControl;
