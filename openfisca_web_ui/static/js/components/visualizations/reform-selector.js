/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons'),
  ReactIntlMixin = require('react-intl');


var ReformSelector = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    diffMode: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    reformName: React.PropTypes.string,
    reforms: React.PropTypes.object.isRequired,
  },
  render: function() {
    return (
      <span>
        <select
          className='form-control'
          onChange={
            event => this.props.onChange({
              diffMode: event.target.value ? this.props.diffMode : false,
              name: event.target.value,
            })
          }
          value={this.props.reformName}
        >
          <option value=''>{this.getIntlMessage('noReform')}</option>
          {
            Lazy(this.props.reforms).map((reformTitle, reformName) => (
              <option key={reformName} value={reformName}>{reformTitle}</option>
            )).toArray()
          }
        </select>
        <div className='checkbox' style={{marginLeft: 10}}>
          <label>
            <input
              checked={this.props.diffMode}
              disabled={ ! this.props.reformName}
              onChange={
                event => this.props.onChange({diffMode: event.target.checked, name: this.props.reformName})
              }
              type='checkbox'
            />
            {this.getIntlMessage('difference')}
          </label>
        </div>
      </span>
    );
  }
});

module.exports = ReformSelector;
