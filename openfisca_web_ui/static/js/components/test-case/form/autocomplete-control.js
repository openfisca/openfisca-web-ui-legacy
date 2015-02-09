/** @jsx React.DOM */
'use strict';

// var Autocomplete = require('ron-react-autocomplete'),
var React = require('react'),
  ReactIntlMixin = require('react-intl');


var AutocompleteControl = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    autocomplete: React.PropTypes.func.isRequired,
    displayedValue: React.PropTypes.string,
    error: React.PropTypes.string,
    label: React.PropTypes.element.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
  },
  handleChange(selectedItem) {
    this.props.onChange({
      displayedValue: selectedItem.title,
      value: selectedItem.id,
    });
  },
  handleDelete() {
    this.props.onChange({
      displayedValue: '',
      value: null,
    });
  },
  handleSearch(options, searchTerm, cb) {
    var onError = (xhr, status, err) => {
      if (this.isMounted()) {
        cb(err);
      }
    };
    var onSuccess = data => {
      if (this.isMounted()) {
        cb(null, data.data.items.map(item => {
          return {
            id: item.code,
            title: item.main_postal_distribution,
          };
        }));
      }
    };
    this.props.autocomplete(searchTerm, onSuccess, onError);
  },
  render() {
    return (
      <div>
        {this.props.label}
        <div className='row'>
          <div className='col-sm-6'>
            {/*
            <Autocomplete
              onChange={this.handleChange}
              search={this.handleSearch}
              value={{
                id: this.props.value,
                title: this.props.displayedValue,
              }}
            />
            */}
          </div>
          <div className='col-sm-6'>
            <button
              className='btn btn-default'
              disabled={this.props.value}
              onClick={this.handleDelete}
              type='button'>
              {this.getIntlMessage('delete')}
            </button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = AutocompleteControl;
