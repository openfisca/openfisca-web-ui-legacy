/** @jsx React.DOM */
'use strict';

var React = require('react');


var EntityRoleSelector = React.createClass({
  propTypes: {
    currentEntityId: React.PropTypes.string,
    entities: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    kind: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    roles: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    selectedEntityId: React.PropTypes.string,
    selectedRole: React.PropTypes.string,
  },
  formatEntityLabel: function(entity) {
    var label = entity.label;
    if (entity.id === this.props.currentEntityId) {
      label += ' (en cours)';
    }
    return label;
  },
  handleEntityChange: function(event) {
    var newEntityId = event.target.value;
    var selectedRole = this.refs.role.getDOMNode().value;
    this.props.onChange(this.props.kind, newEntityId, selectedRole);
  },
  handleRoleChange: function(event) {
    var newRole = event.target.value;
    var selectedEntityId = this.refs.entity.getDOMNode().value;
    this.props.onChange(this.props.kind, selectedEntityId, newRole);
  },
  render: function() {
    return (
      <div className='form-group'>
        <label className='control-label' forHtml={this.props.kind}>{this.props.label}</label>
        <div className='row'>
          <div className='col-sm-6'>
            <select
              className="form-control"
              id={this.props.kind}
              onChange={this.handleEntityChange}
              ref='entity'
              value={this.props.selectedEntityId}>
              {this.props.currentEntityId || <option key='none' value='none'>Aucun</option>}
              {
                this.props.entities.map(function(entity) {
                  return (
                    <option key={entity.id} value={entity.id}>{this.formatEntityLabel(entity)}</option>
                  );
                }, this)
              }
            </select>
          </div>
          <div className='col-sm-6'>
            <select
              className="form-control"
              onChange={this.handleRoleChange}
              ref='role'
              value={this.props.selectedRole}>
              {
                this.props.roles.map(function(role) {
                  return (
                    <option key={role.id} value={role.id}>{role.label}</option>
                  );
                }, this)
              }
            </select>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = EntityRoleSelector;
