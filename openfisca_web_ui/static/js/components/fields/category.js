/** @jsx React.DOM */
'use strict';

var React = require('react');

var SuggestionGlyphicon = require('./suggestion-glyphicon')

var Category = React.createClass({
  propTypes: {
    children: React.PropTypes.arrayOf(React.PropTypes.component).isRequired,
    hasErrors: React.PropTypes.bool,
    hasSuggestions: React.PropTypes.bool,
    index: React.PropTypes.number.isRequired,
    label: React.PropTypes.string.isRequired,
  },
  render: function() {
    return (
      <div className={React.addons.classSet('panel', this.props.hasErrors ? 'panel-danger' : 'panel-default')}>
        <div className="panel-heading">
          {
            this.props.hasSuggestions ?
              <SuggestionGlyphicon className="pull-right" />
              : null
          }
          <h4 className="panel-title">
            <a
              data-parent="#accordion"
              data-toggle="collapse"
              href={'#category-' + this.props.index}>
              {this.props.label}
            </a>
          </h4>
        </div>
        <div
          className={React.addons.classSet('panel-collapse', 'collapse', this.props.index === 0 ? 'in' : null)}
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
