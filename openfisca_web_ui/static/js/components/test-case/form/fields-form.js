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
  StringControl = require('./string-control');

var cx = React.addons.classSet;


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
                key={'category-' + index}
                label={category.label}>
                {category.columns.map(this.renderControl)}
              </Category>
            );
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
    var suggestionExplanation = 'Valeur suggérée par le simulateur et utilisée dans ses calculs.';
    switch(column['@type']) {
      case 'Boolean':
        control = (
          <BooleanControl
            cerfaField={column.cerfa_field /* jshint ignore:line */}
            default={column.default}
            error={error}
            label={label}
            name={column.name}
            onChange={this.props.onChange.bind(null, column.name)}
            suggestion={suggestion}
            suggestionExplanation={suggestionExplanation}
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
            suggestionExplanation={suggestionExplanation}
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
            suggestionExplanation={suggestionExplanation}
            value={value}
          />
        );
        break;
      case 'Integer':
        control = (
          <IntegerControl
            cerfaField={column.cerfa_field /* jshint ignore:line */}
            default={column.default}
            error={error}
            label={label}
            max={column.max}
            min={column.min}
            name={column.name}
            onChange={this.props.onChange.bind(null, column.name)}
            suggestion={suggestion}
            suggestionExplanation={suggestionExplanation}
            value={value}
            valType={column.val_type} // jshint ignore:line
          />
        );
        break;
      case 'String':
        control = (
          <StringControl
            cerfaField={column.cerfa_field /* jshint ignore:line */}
            default={column.default}
            error={error}
            label={label}
            name={column.name}
            onChange={this.props.onChange.bind(null, column.name)}
            required={column.required}
            suggestion={suggestion}
            suggestionExplanation={suggestionExplanation}
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
