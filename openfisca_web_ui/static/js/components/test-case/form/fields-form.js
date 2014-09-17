/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react/addons');

var BooleanControl = require('./boolean-control'),
  Category = require('./category'),
  DateControl = require('./date-control'),
  EnumerationControl = require('./enumeration-control'),
  IntegerControl = require('./integer-control'),
  Label = require('./label'),
  StringControl = require('./string-control'),
  SuggestionIcon = require('../suggestion-icon');

var cx = React.addons.classSet;


var FieldsForm = React.createClass({
  propTypes: {
    categories: React.PropTypes.array.isRequired,
    errors: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    values: React.PropTypes.object,
  },
  render: function() {
    return (
      <div className="panel-group" id="accordion">
        {
          this.props.categories.length === 1 ?
            this.props.categories[0].columns.map(this.renderControl) :
            this.props.categories.map((category, index) => {
              var categoryColumnNames = category.columns.map(column => column.name);
              var hasErrors = !! (
                this.props.errors &&
                Lazy(categoryColumnNames).intersection(Object.keys(this.props.errors)).size()
              );
              var hasSuggestions = !! (
                this.props.suggestions &&
                Lazy(categoryColumnNames).intersection(Object.keys(this.props.suggestions)).size()
              );
              return category.columns && (
                <Category
                  hasErrors={hasErrors}
                  hasSuggestions={hasSuggestions}
                  index={index}
                  key={index}
                  label={category.label}>
                  {category.columns.map(this.renderControl)}
                </Category>
              );
            })
        }
      </div>
    );
  },
  renderControl: function(column) {
    var control;
    var error = this.props.errors && this.props.errors[column.name],
      suggestion = this.props.suggestions && this.props.suggestions[column.name],
      value = this.props.values && this.props.values[column.name];
    var label = (
      <Label name={column.name} required={column.required}>{column.label}</Label>
    );
    var suggestionIcon = (
      <SuggestionIcon>
        Valeur suggérée par le simulateur et utilisée dans ses calculs.
      </SuggestionIcon>
    );
    var cerfaField = column.cerfa_field; // jshint ignore:line
    switch(column['@type']) {
      case 'Boolean':
        control = (
          <BooleanControl
            cerfaField={cerfaField}
            default={column.default}
            error={error}
            label={label}
            name={column.name}
            onChange={this.props.onChange.bind(null, column)}
            suggestion={suggestion}
            suggestionIcon={suggestionIcon}
            value={value}
          />
        );
        break;
      case 'Date':
        control = (
          <DateControl
            default={column.default}
            error={error}
            label={label}
            name={column.name}
            onChange={this.props.onChange.bind(null, column)}
            suggestion={suggestion}
            suggestionIcon={suggestionIcon}
            value={value}
          />
        );
        break;
      case 'Enumeration':
        control = (
          <EnumerationControl
            default={column.default}
            error={error}
            label={label}
            labels={column.labels}
            name={column.name}
            onChange={this.props.onChange.bind(null, column)}
            suggestion={suggestion}
            suggestionIcon={suggestionIcon}
            value={value}
          />
        );
        break;
      case 'Integer':
        control = (
          <IntegerControl
            cerfaField={cerfaField}
            default={column.default}
            error={error}
            label={label}
            max={column.max}
            min={column.min}
            name={column.name}
            onChange={this.props.onChange.bind(null, column)}
            suggestion={suggestion}
            suggestionIcon={suggestionIcon}
            value={value}
            valType={column.val_type} // jshint ignore:line
          />
        );
        break;
      case 'String':
        control = (
          <StringControl
            autocomplete={column.autocomplete}
            cerfaField={cerfaField}
            default={column.default}
            error={error}
            label={label}
            name={column.name}
            onChange={this.props.onChange.bind(null, column)}
            required={column.required}
            suggestion={suggestion}
            suggestionIcon={suggestionIcon}
            value={value}
          />
        );
        break;
      default:
        invariant(false, 'column type not expected for column: %s', column);
    }
    return (
      <div className={cx('form-group', error && 'has-error')} key={column.name}>
        {control}
        {error && <span className="help-block">{error}</span>}
      </div>
    );
  },
});

module.exports = FieldsForm;
