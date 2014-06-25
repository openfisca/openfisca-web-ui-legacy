/** @jsx React.DOM */
'use strict';

var React = require('react/addons');


var Individu = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,
    edited: React.PropTypes.bool,
    errors: React.PropTypes.object,
    id: React.PropTypes.string.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func.isRequired,
    onMove: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    value: React.PropTypes.object.isRequired,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    var btnColorClass = this.props.edited ? 'btn-info' : 'btn-default';
    return (
      <div style={{marginBottom: '0.5em'}}>
        <div className="btn-group">
          <button
            className={React.addons.classSet('btn', btnColorClass, 'btn-sm')}
            disabled={this.props.disabled}
            onClick={this.props.onEdit.bind(null, 'individus', this.props.id)}
            type="button">
            {this.props.value.nom_individu /* jshint ignore:line */}
            {
              this.props.suggestions ?
                <span className="glyphicon glyphicon-info-sign"></span>
                : null
            }
          </button>
          <button
            className={
              React.addons.classSet('btn', btnColorClass, 'btn-sm', 'dropdown-toggle',
                this.props.disabled && 'disabled')
            }
            data-toggle="dropdown"
            type="button">
            <span className="caret"></span>
            <span className="sr-only">Toggle Dropdown</span>
          </button>
          <ul className="dropdown-menu" role="menu">
            <li role="presentation">
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onMove.bind(null, this.props.id))}
                role="menuitem"
                tabIndex="-1">
                Déplacer
              </a>
              <a
                href="#"
                onClick={this.preventDefaultThen.bind(null, this.props.onDelete.bind(null, this.props.id))}
                role="menuitem"
                tabIndex="-1">
                Supprimer
              </a>
            </li>
          </ul>
        </div>
        {
          this.props.errors ?
            <p className="text-danger">Erreur</p>
            : null
        }
      </div>
    );
  }
});

module.exports = Individu;
