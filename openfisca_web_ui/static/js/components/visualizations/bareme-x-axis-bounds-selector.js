/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
	ReactIntlMixin = require('react-intl');

var polyfills = require('../../polyfills');

var cx = React.addons.classSet;


var BaremeXAxisBoundsSelector = React.createClass({
	mixins: [ReactIntlMixin],
	propTypes: {
		defaultXMaxValue: React.PropTypes.number.isRequired,
		defaultXMinValue: React.PropTypes.number.isRequired,
		onSettingsChange: React.PropTypes.func.isRequired,
		xMaxValue: React.PropTypes.number.isRequired,
		xMinValue: React.PropTypes.number.isRequired,
	},
	getInitialState: function() {
		return {
			xMaxValue: this.props.xMaxValue,
			xMinValue: this.props.xMinValue,
		};
	},
	handleMaxValueChange: function() {
		var newXMaxValue = polyfills.valueAsNumber(this.refs.xMaxValue.getDOMNode());
		this.setState({xMaxValue: newXMaxValue});
	},
	handleMinValueChange: function() {
		var newXMinValue = polyfills.valueAsNumber(this.refs.xMinValue.getDOMNode());
		this.setState({xMinValue: newXMinValue});
	},
	handleReset: function(event) {
		event.preventDefault();
		var changeset = {xMaxValue: this.props.defaultXMaxValue, xMinValue: this.props.defaultXMinValue};
		this.setState(changeset, () => {
			this.props.onSettingsChange(changeset, true);
		});
	},
	handleSubmit: function(event) {
		event.preventDefault();
		var newXMaxValue = this.state.xMaxValue || this.props.defaultXMaxValue;
		var newXMinValue = this.state.xMinValue || this.props.defaultXMinValue;
		this.props.onSettingsChange({xMaxValue: newXMaxValue, xMinValue: newXMinValue}, true);
	},
	render: function() {
		var isMaxValueLessThanMinValue = this.state.xMaxValue !== null && this.state.xMinValue !== null &&
			this.state.xMaxValue < this.state.xMinValue;
		return (
			<form className="form-horizontal" onReset={this.handleReset} onSubmit={this.handleSubmit} role="form">
				<div className={cx({
					'form-group': true,
					'form-group-sm': true,
					'has-error': isMaxValueLessThanMinValue,
				})}>
					<label className="col-xs-6 control-label" htmlFor="x-axis-min-value">
						{this.getIntlMessage('minimumLabel')}
					</label>
					<div className='col-xs-6'>
						<input
							className='form-control'
							min={0}
							onChange={this.handleMinValueChange}
							placeholder={this.props.defaultXMinValue}
							ref='xMinValue'
							type='number'
							value={this.state.xMinValue}
							/>
					</div>
				</div>
				<div className={cx({
					'form-group': true,
					'form-group-sm': true,
					'has-error': isMaxValueLessThanMinValue,
				})}>
					<label className="col-xs-6 control-label" htmlFor="x-axis-max-value">
						{this.getIntlMessage('maximumLabel')}
					</label>
					<div className='col-xs-6'>
						<input
							className='form-control'
							id='x-axis-max-value'
							min={0}
							onChange={this.handleMaxValueChange}
							placeholder={this.props.defaultXMaxValue}
							ref='xMaxValue'
							type='number'
							value={this.state.xMaxValue}
							/>
						{
							isMaxValueLessThanMinValue && (
								<p className='help-block'>
									{this.getIntlMessage('minimumValueLessThanMaximumValueExplanation')}
								</p>
							)
						}
					</div>
				</div>
				<div className="form-group form-group-sm">
					<div className="col-xs-offset-6 col-xs-6">
						<button
							className='btn btn-default btn-sm'
							disabled={
								(
									(this.state.xMaxValue || this.props.defaultXMaxValue) === this.props.xMaxValue &&
									(this.state.xMinValue || this.props.defaultXMinValue) === this.props.xMinValue
								) || (
									(this.state.xMaxValue || this.props.defaultXMaxValue) <
										(this.state.xMinValue || this.props.defaultXMinValue)
								)
							}
							type='submit'>
							{this.getIntlMessage('apply')}
						</button>
						<button className='btn btn-default btn-sm pull-right' type='reset'>
							{this.getIntlMessage('reset')}
						</button>
					</div>
				</div>
			</form>
		);
	},
});


module.exports = BaremeXAxisBoundsSelector;
