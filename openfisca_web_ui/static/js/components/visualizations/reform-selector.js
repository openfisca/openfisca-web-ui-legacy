/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  ReactIntlMixin = require('react-intl');

var Tooltip = require('../tooltip');

var cx = React.addons.classSet;


var ReformSelector = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
  },
  render: function() {
    var classes = value => cx({
      active: value === this.props.value,
      btn: true,
      'btn-default': true,
    });
    return (
      <div className='btn-group'>
        <button className={classes(null)} onClick={() => this.props.onChange(null)}>
          {this.getIntlMessage('reference')}
        </button>
        <Tooltip>
          <button
            className={classes('reform')}
            onClick={() => this.props.onChange('reform')}
            title='Projet de loi de finances rectificative'>
            PLFR 2014
          </button>
        </Tooltip>
        <button className={classes('diff')} onClick={() => this.props.onChange('diff')}>
          {this.getIntlMessage('difference')}
        </button>
      </div>
    );
  }
});

module.exports = ReformSelector;
