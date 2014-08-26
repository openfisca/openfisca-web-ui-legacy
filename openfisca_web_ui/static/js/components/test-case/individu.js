/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var SuggestionIcon = require('./suggestion-icon');

var cx = React.addons.classSet;


var Individu = React.createClass({
  propTypes: {
    active: React.PropTypes.bool,
    errors: React.PropTypes.object,
    onDelete: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func,
    onMove: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    value: React.PropTypes.object.isRequired,
  },
  render: function() {
    var btnColorClass = this.props.errors ? 'btn-danger' : 'btn-default';
    return (
      <div style={{marginBottom: '0.5em'}}>
        <div className="btn-group">
          <button
            className={cx('btn', btnColorClass, 'btn-sm', this.props.active && 'active')}
            onClick={this.props.onEdit}
            type="button">
            {this.props.value.nom_individu /* jshint ignore:line */}
          </button>
          <button
            className={cx('btn', btnColorClass, 'btn-sm', 'dropdown-toggle')}
            data-toggle="dropdown"
            type="button">
            <span className="caret"></span>
            <span className="sr-only">Toggle Dropdown</span>
          </button>
          <ul className="dropdown-menu" role="menu">
            <li role="presentation">
              <a
                href="#"
                onClick={event => { event.preventDefault(); this.props.onEdit && this.props.onEdit(); }}
                role="menuitem"
                tabIndex="-1">
                Éditer
              </a>
              <a
                href="#"
                onClick={event => { event.preventDefault(); this.props.onMove(); }}
                role="menuitem"
                tabIndex="-1">
                Déplacer
              </a>
              <a
                href="#"
                onClick={event => { event.preventDefault(); this.props.onDelete(); }}
                role="menuitem"
                tabIndex="-1">
                Supprimer
              </a>
            </li>
          </ul>
        </div>
        {
          this.props.suggestions && (
            <SuggestionIcon>
              {`« ${this.props.value.nom_individu} » contient des suggestions.` /* jshint ignore:line */}
            </SuggestionIcon>
          )
        }
      </div>
    );
  }
});

module.exports = Individu;
