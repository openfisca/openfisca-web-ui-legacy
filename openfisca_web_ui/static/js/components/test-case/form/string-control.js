/** @jsx React.DOM */
'use strict';

var $ = require('jquery'),
  React = require('react'),
  typeahead = require('typeahead.js');

var CerfaField = require('./cerfa-field');


var StringControl = React.createClass({
  propTypes: {
    autocomplete: React.PropTypes.func,
    cerfaField: React.PropTypes.any,
    default: React.PropTypes.string,
    error: React.PropTypes.string,
    label: React.PropTypes.component.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    required: React.PropTypes.bool,
    suggestion: React.PropTypes.string,
    suggestionIcon: React.PropTypes.component,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.shape({
        displayedValue: React.PropTypes.string,
        value: React.PropTypes.string,
      }),
    ]),
  },
  componentDidMount: function() {
    if (this.props.autocomplete) {
      var input = this.refs.input.getDOMNode();
      $(input)
      .typeahead({
        highlight: true,
        minLength: 1,
      }, {
        displayKey: 'main_postal_distribution',
        source: (query, cb) => {
          var onComplete = res => cb(res.data.items),
            onError = error => console.error(error);
          if (input.value) {
            this.props.autocomplete(input.value, onComplete, onError);
          }
        },
      })
      .on('typeahead:autocompleted typeahead:selected',
        (event, suggestion, datasetName) => this.props.onChange({
          displayedValue: suggestion.main_postal_distribution,
          value: suggestion.code,
        })
      )
      .on('typeahead:closed', () => {
        if (this.props.value && this.props.value.displayedValue && ! this.props.value.value) {
          $(input).typeahead('val', '');
        }
      });
    }
  },
  componentDidUpdate: function(prevProps) {
    if (this.props.autocomplete && this.props.value && ! this.props.value.displayedValue) {
      $(this.refs.input.getDOMNode()).typeahead('val', '');
    }
  },
  componentWillUnmount: function() {
    if (this.props.autocomplete) {
      $(this.refs.input.getDOMNode()).typeahead('destroy');
    }
  },
  handleChange: function(event) {
    var value = event.target.value;
    if (this.props.autocomplete) {
      this.props.onChange({
        displayedValue: this.props.value && this.props.value.value ? '' : value,
        value: null,
      });
    } else {
      this.props.onChange(value);
    }
  },
  render: function() {
    return (
      <div>
        {this.props.label}
        {! this.props.error && this.props.suggestion && this.props.suggestionIcon}
        <input
          className="form-control"
          id={this.props.name}
          onChange={this.handleChange}
          placeholder={this.props.suggestion || this.props.default}
          ref='input'
          required={this.props.required}
          type="text"
          value={
              this.props.autocomplete ? (
                this.props.value ? this.props.value.displayedValue : ''
              ) :
              this.props.value
          }
        />
        {
          this.props.cerfaField && (
            <div className="col-md-8">
              <CerfaField value={this.props.cerfaField} />
            </div>
          )
        }
      </div>
    );
  }
});

module.exports = StringControl;
