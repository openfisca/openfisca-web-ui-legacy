/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  ReactIntlMixin = require('react-intl');

var cx = React.addons.classSet;


var ReformSelector = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    diffMode: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    reformName: React.PropTypes.string,
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
          <option value=''>{this.getIntlMessage('reference')}</option>
          <option value='plfrss2014'>PLFR 2014</option>
          <option value='landais_piketty_saez'>Landais Piketty Saez</option>
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
