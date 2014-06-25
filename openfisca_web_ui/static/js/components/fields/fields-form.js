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
  StringControl = require('./string-control');


var FieldsForm = React.createClass({
  propTypes: {
    categories: React.PropTypes.array.isRequired,
    errors: React.PropTypes.object,
    onCancel: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    title: React.PropTypes.string.isRequired,
    values: React.PropTypes.object,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    return (
      <form onSubmit={this.preventDefaultThen.bind(null, this.props.onSave)} role="form">
        <div className="row">
          <div className="col-sm-2">
            <button className="btn btn-default" onClick={this.props.onCancel} type="button">
              Annuler
            </button>
          </div>
          <div className="col-sm-8">
            <h2 style={{margin: 0, textAlign: 'center'}}>{this.props.title}</h2>
          </div>
          <div className="col-sm-2">
            <button className="btn btn-primary" style={{marginRight: 5}} type="submit">
              Enregistrer
            </button>
          </div>
        </div>
        <hr/>
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
      </form>
    );
  },
  renderControl: function(column) {
    var control;
    var error = this.props.errors && this.props.errors[column.name],
      suggestion = this.props.suggestions && this.props.suggestions[column.name],
      value = this.props.values && this.props.values[column.name];
    switch(column['@type']) {
      case 'Boolean':
        control = (
          <BooleanControl
            default={column.default}
            error={error}
            label={column.label}
            name={column.name}
            onChange={this.props.onChange}
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
            label={column.label}
            name={column.name}
            onChange={this.props.onChange}
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
              label={column.label}
              labels={column.labels}
              name={column.name}
              onChange={this.props.onChange}
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
            label={column.label}
            max={column.max}
            min={column.min}
            name={column.name}
            onChange={this.props.onChange}
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
            label={column.label}
            name={column.name}
            onChange={this.props.onChange}
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
      <div className={React.addons.classSet('form-group', error ? 'has-error' : null)} key={column.name}>
        {control}
      </div>
    );
  },
});

module.exports = FieldsForm;
