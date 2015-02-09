/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  ReactIntlMixin = require('react-intl');


var cx = React.addons.classSet;


var ReformSelect = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    className: React.PropTypes.string,
    diffMode: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    onDiffModeChange: React.PropTypes.func.isRequired,
    onNameChange: React.PropTypes.func.isRequired,
    reforms: React.PropTypes.object.isRequired,
    selectedReformKey: React.PropTypes.string,
    style: React.PropTypes.object,
  },
  render: function() {
    return (
      <div className={this.props.className} style={this.props.style}>
        <select
          className='form-control'
          disabled={this.props.disabled}
          onChange={(event) => this.props.onNameChange(event.target.value || null)}
          title={this.getIntlMessage('reform')}
          value={this.props.selectedReformKey}
        >
          <option value=''>{this.getIntlMessage('noReform')}</option>
          {
            Lazy(this.props.reforms).map((reformName, reformKey) => (
              <option key={reformKey} value={reformKey}>{reformName}</option>
            )).toArray()
          }
        </select>
        {
          this.props.selectedReformKey && (
            <div
              className={cx({checkbox: true, disabled: this.props.disabled})}
              style={{marginLeft: 10}}
            >
              <label>
                <input
                  checked={this.props.diffMode}
                  disabled={this.props.disabled || ! this.props.selectedReformKey}
                  onChange={(event) => this.props.onDiffModeChange(event.target.checked)}
                  type='checkbox'
                />
                {this.getIntlMessage('difference')}
              </label>
            </div>
          )
        }
      </div>
    );
  }
});

module.exports = ReformSelect;
