/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
	ReactIntlMixin = require('react-intl');

var polyfills = require('../../polyfills');

var cx = React.addons.classSet;


var BaremeSettings = React.createClass({
	mixins: [ReactIntlMixin],
	propTypes: {
    columns: React.PropTypes.object.isRequired,
		defaultXAxisVariableCode: React.PropTypes.string.isRequired,
		defaultXMaxValue: React.PropTypes.number.isRequired,
		defaultXMinValue: React.PropTypes.number.isRequired,
		onSettingsChange: React.PropTypes.func.isRequired,
		xAxisVariableCode: React.PropTypes.string.isRequired,
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
		var changeset = {
			xAxisVariableCode: this.props.defaultXAxisVariableCode,
			xMaxValue: this.props.defaultXMaxValue,
			xMinValue: this.props.defaultXMinValue,
		};
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
	handleVariableCodeChange: function() {
		this.props.onSettingsChange({xAxisVariableCode: event.target.value}, true);
	},
	render: function() {
		var isMaxValueLessThanMinValue = this.state.xMaxValue !== null && this.state.xMinValue !== null &&
			this.state.xMaxValue < this.state.xMinValue;
		return (
			<form className="form-horizontal" onReset={this.handleReset} onSubmit={this.handleSubmit} role="form">
				<div className='form-group form-group-sm'>
					<label className="col-xs-6 control-label" htmlFor="x-axis-variable-code">
						{this.getIntlMessage('variable')}
					</label>
					<div className='col-xs-6'>
						<select
							className='form-control'
							id='x-axis-variable-code'
							onChange={this.handleVariableCodeChange}
							value={this.props.xAxisVariableCode}>
							<option value='sali'>{this.props.columns.sali.label}</option>
							<option value='choi'>{this.props.columns.choi.label}</option>
						</select>
					</div>
				</div>
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
						<div className='pull-right'>
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
								style={{marginRight: 10}}
								type='submit'>
								{this.getIntlMessage('apply')}
							</button>
							<button className='btn btn-default btn-sm' type='reset'>
								{this.getIntlMessage('reset')}
							</button>
						</div>
					</div>
				</div>
			</form>
		);
	},
});


module.exports = BaremeSettings;
