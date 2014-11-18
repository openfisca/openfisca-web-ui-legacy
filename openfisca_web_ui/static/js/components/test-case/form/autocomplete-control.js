/** @jsx React.DOM */
'use strict';

var Autocomplete = require('ron-react-autocomplete/src/index'),
	React = require('react');


var AutocompleteControl = React.createClass({
	propTypes: {
		autocomplete: React.PropTypes.func.isRequired,
		displayedValue: React.PropTypes.string,
		error: React.PropTypes.string,
		label: React.PropTypes.component.isRequired,
		name: React.PropTypes.string.isRequired,
		onChange: React.PropTypes.func.isRequired,
		value: React.PropTypes.string,
	},
	handleChange: function(selectedItem) {
		this.props.onChange({
			displayedValue: selectedItem.title,
			value: selectedItem.id,
		});
	},
	handleSearch: function(options, searchTerm, cb) {
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
						title: item.main_postal_distribution, // jshint ignore:line
					};
				}))
			}
		};
		this.props.autocomplete(searchTerm, onSuccess, onError);
	},
	render: function() {
		return (
			<div>
				{this.props.label}
	      <Autocomplete
					onChange={this.handleChange}
					search={this.handleSearch}
					value={{
						id: this.props.value,
						title: this.props.displayedValue,
					}}
				/>
			</div>
		);
	}
});

module.exports = AutocompleteControl;
