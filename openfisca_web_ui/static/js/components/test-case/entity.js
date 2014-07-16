/** @jsx React.DOM */
'use strict';

var React = require('react/addons');


var Entity = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,
    hasErrors: React.PropTypes.bool,
    isEdited: React.PropTypes.bool,
    label: React.PropTypes.string.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func.isRequired,
  },
  preventDefaultThen: function(callback, event) {
    event.preventDefault();
    callback();
  },
  render: function() {
    var isEdited = this.props.isEdited;
    var btnColorClass = isEdited ? 'btn-info' : 'btn-default';
    return (
      <div className={
        React.addons.classSet('panel', this.props.hasErrors ? 'panel-danger' : 'panel-default')
      }>
        <div className="panel-heading">
          <div className="btn-group">
            <button
              className={React.addons.classSet('btn', btnColorClass, 'btn-sm')}
              disabled={this.props.disabled}
              onClick={this.props.onEdit}
              type="button">
              {this.props.label}
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
              <li>
                <a
                  href="#"
                  onClick={
                    this.preventDefaultThen.bind(null, this.props.onDelete)
                  }>
                  Supprimer
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="list-group">
          {this.props.children}
        </div>
      </div>
    );
  },
});

module.exports = Entity;
