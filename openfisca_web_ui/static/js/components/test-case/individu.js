/** @jsx React.DOM */
'use strict';

var React = require('react/addons'),
  ReactIntlMixin = require('react-intl');

var SuggestionIcon = require('./suggestion-icon');

var cx = React.addons.classSet;


var Individu = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    active: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    errors: React.PropTypes.object,
    id: React.PropTypes.string.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func,
    onMove: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
  },
  render() {
    var btnColorClass = this.props.errors ? 'btn-danger' : 'btn-default';
    return (
      <div style={{marginBottom: '0.5em'}}>
        <div className="btn-group">
          <button
            className={cx('btn', btnColorClass, 'btn-sm', this.props.active ? 'btn-warning' : null)}
            disabled={this.props.disabled}
            onClick={this.props.onEdit}
            type="button">
            {this.props.id}
          </button>
          <button
            className={cx('btn', btnColorClass, 'btn-sm', 'dropdown-toggle')}
            data-toggle="dropdown"
            disabled={this.props.disabled}
            type="button">
            <span className="caret"></span>
            <span className="sr-only">Toggle Dropdown</span>
          </button>
          {
            ! this.props.disabled && (
              <ul className="dropdown-menu" role="menu">
                <li role="presentation">
                  <a
                    href="#"
                    onClick={event => { event.preventDefault(); this.props.onEdit && this.props.onEdit(); }}
                    role="menuitem"
                    tabIndex="-1">
                    {this.getIntlMessage('edit')}
                  </a>
                  <a
                    href="#"
                    onClick={event => { event.preventDefault(); this.props.onMove(); }}
                    role="menuitem"
                    tabIndex="-1">
                    {this.getIntlMessage('move')}
                  </a>
                  <a
                    href="#"
                    onClick={event => { event.preventDefault(); this.props.onDelete(); }}
                    role="menuitem"
                    tabIndex="-1">
                    {this.getIntlMessage('delete')}
                  </a>
                </li>
              </ul>
            )
          }
        </div>
        {
          this.props.suggestions && (
            <SuggestionIcon>
              {this.formatMessage(this.getIntlMessage('individuContainsSuggestions'), {id: this.props.id})}
            </SuggestionIcon>
          )
        }
      </div>
    );
  }
});

module.exports = Individu;
