/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');

var Tooltip = require('../../tooltip');

var cx = React.addons.classSet;


var Category = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    children: React.PropTypes.arrayOf(React.PropTypes.component).isRequired,
    hasErrors: React.PropTypes.bool,
    hasSuggestions: React.PropTypes.bool,
    index: React.PropTypes.number.isRequired,
    label: React.PropTypes.string.isRequired,
  },
  render: function() {
    return (
      <div className={cx('panel', this.props.hasErrors ? 'panel-danger' : 'panel-default')}>
        <div className="panel-heading">
          <h4 className="panel-title">
            {
              this.props.hasSuggestions ? (
                <Tooltip placement='top'>
                  <a
                    data-parent="#accordion"
                    data-toggle="collapse"
                    href={'#category-' + this.props.index}
                    style={{
                      color: 'red',
                      fontStyle: 'italic',
                    }}
                    title={this.getIntlMessage('categoryContainsSuggestions')}>
                    {this.props.label}
                  </a>
                </Tooltip>
              ) : (
                <a
                  data-parent="#accordion"
                  data-toggle="collapse"
                  href={'#category-' + this.props.index}>
                  {this.props.label}
                </a>
              )
            }
          </h4>
        </div>
        <div
          className={cx('panel-collapse', 'collapse', this.props.index === 0 && 'in')}
          id={'category-' + this.props.index}>
          <div className="panel-body">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Category;
