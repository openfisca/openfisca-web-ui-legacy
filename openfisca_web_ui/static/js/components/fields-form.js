/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  React = require('react');


var FieldsForm = React.createClass({
  propTypes: {
    categories: React.PropTypes.array.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
  render: function() {
    return (
      <div>
        <button
          className="btn btn-primary"
          onClick={this.props.onSave}
          style={{marginRight: 5}}>
          Enregistrer
        </button>
        <button
          className="btn btn-default pull-right"
          onClick={this.props.onCancel}>
          Annuler
        </button>
        <hr/>
        <div>
          <h1>{this.props.title}</h1>
          {this.props.categories.map(this.renderCategory)}
        </div>
      </div>
    );
  },
  renderCategory: function(category, idx) {
    return (
      <div key={'category-' + idx}>
        <h2>{category.label}</h2>
        {category.columns.map(this.renderControl)}
      </div>
    );
  },
  renderControl: function(column) {
    if (column['@type'] === 'Boolean') {
      return (
        <div>
          <label className="control-label">{column.label}</label>
          <div className="row">
            <div className="col-sm-6">
              <label className="radio-inline">
                <input key={column.name} name={column.name} type="radio" value="" />
                Non renseigné
              </label>
              <label className="radio-inline">
                <input key={column.name} name={column.name} type="radio" value="1" />
                Oui
              </label>
              <label className="radio-inline">
                <input key={column.name} name={column.name} type="radio" value="0" />
                Non
              </label>
            </div>
            <div className="col-sm-6">
              <span className="help-block">
                TODO
              </span>
            </div>
          </div>
        </div>
      );
    } else if (column['@type'] === 'Date') {
      return (
        <div>
          <label className="control-label" htmlFor={column.name}>{column.label}</label>
          <input
            className="form-control"
            id={column.name}
            placeholder="suggestion || default"
            type="date"
          />
        </div>
      );
    } else if (column['@type'] === 'Enumeration') {
      return (
        <div>
          <label className="control-label" htmlFor={column.name}>{column.label}</label>
          <div className="input-group">
            formSelectControl
            <span className="input-group-addon">formControlSuggestionGlyphicon</span>
          </div>
        </div>
      );
    } else if (column['@type'] === 'Float') {
      return (
        <div>
          <label className="control-label" htmlFor={column.name}>{column.label}</label>
          <input className="form-control" id={column.name} placeholder={column.default} type="number" />
        </div>
      );
    } else if (column['@type'] === 'Integer') {
      return (
        <div>
          <label className="control-label" htmlFor={column.name}>{column.label}</label>
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                formIntegerControl
                <span className="input-group-addon">
                {
                  column.val_type === 'monetary' ? // jshint ignore:line
                    <span className="glyphicon glyphicon-euro"></span>
                    : null
                }
                formControlSuggestionGlyphicon
                </span>
              </div>
            </div>
            <div className="col-md-8">
              formControlCerfaField
            </div>
          </div>
        </div>
      );
    } else if (column['@type'] === 'String') {
      return (
        <div>
          <label className="control-label" htmlFor={column.name}>{column.label}</label>
          <input
            className="form-control"
            id={column.name}
            placeholder={column.default}
            required={column.required ? 'required' : null}
            type="text"
          />
          formControlCerfaField
        </div>
      );
    } else {
      invariant(false, 'column type not expected for column: ' + column);
    }
  },
});

module.exports = FieldsForm;
