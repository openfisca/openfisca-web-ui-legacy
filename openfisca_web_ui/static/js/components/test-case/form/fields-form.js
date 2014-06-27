/** @jsx React.DOM */
'use strict';

var intersection = require('lodash.intersection'),
  invariant = require('react/lib/invariant'),
  React = require('react/addons');

var BooleanControl = require('./boolean-control'),
  Category = require('./category'),
  DateControl = require('./date-control'),
  EnumerationControl = require('./enumeration-control'),
  IntegerControl = require('./integer-control'),
  Label = require('./label'),
  StringControl = require('./string-control');


var FieldsForm = React.createClass({
  propTypes: {
    categories: React.PropTypes.array.isRequired,
    errors: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    values: React.PropTypes.object,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    return (
      <div className="panel-group" id="accordion">
        {
          this.props.categories.map(function(category, index) {
            var categoryColumnNames = category.columns.map(function(column) { return column.name; });
            var hasErrors = !! (
              this.props.errors &&
              intersection(categoryColumnNames, Object.keys(this.props.errors)).length
            );
            var hasSuggestions = !! (
              this.props.suggestions &&
              intersection(categoryColumnNames, Object.keys(this.props.suggestions)).length
            );
            return category.columns ? (
              <Category
                hasErrors={hasErrors}
                hasSuggestions={hasSuggestions}
                index={index}
                key={'category-' + index}
                label={category.label}>
                {category.columns.map(this.renderControl)}
              </Category>
            ) : null;
          }, this)
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
    switch(column['@type']) {
      case 'Boolean':
        control = (
          <BooleanControl
            default={column.default}
            error={error}
            label={label}
            name={column.name}
            onChange={this.props.onChange.bind(null, column.name)}
            suggestion={suggestion}
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
            onChange={this.props.onChange.bind(null, column.name)}
            suggestion={suggestion}
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
            onChange={this.props.onChange.bind(null, column.name)}
            suggestion={suggestion}
            value={value}
          />
        );
        break;
      case 'Integer':
        control = (
          <IntegerControl
            cerfaField={this.props.cerfaField}
            default={column.default}
            error={error}
            label={label}
            max={column.max}
            min={column.min}
            name={column.name}
            onChange={this.props.onChange.bind(null, column.name)}
            suggestion={suggestion}
            value={value}
            valType={column.val_type} // jshint ignore:line
          />
        );
        break;
      case 'String':
        control = (
          <StringControl
            cerfaField={this.props.cerfaField}
            default={column.default}
            error={error}
            label={label}
            name={column.name}
            onChange={this.props.onChange.bind(null, column.name)}
            required={column.required}
            suggestion={suggestion}
            value={value}
          />
        );
        break;
      default:
        invariant(false, 'column type not expected for column: %s', column);
    }
    return (
      <div className={React.addons.classSet('form-group', error && 'has-error')} key={column.name}>
        {control}
        {error && <span className="help-block">{error}</span>}
      </div>
    );
  },
});

module.exports = FieldsForm;
