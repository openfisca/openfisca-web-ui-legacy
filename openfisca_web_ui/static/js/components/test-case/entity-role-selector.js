/** @jsx React.DOM */
'use strict';

var React = require('react');


var EntityRoleSelector = React.createClass({
  propTypes: {
    currentEntityId: React.PropTypes.string.isRequired,
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
    selectedEntityId: React.PropTypes.string.isRequired,
    selectedRole: React.PropTypes.string.isRequired,
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
    this.props.onChange(this.props.kind, newEntityId, this.props.selectedRole);
  },
  handleRoleChange: function(event) {
    var newRole = event.target.value;
    this.props.onChange(this.props.kind, this.props.selectedEntityId, newRole);
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
              value={this.props.selectedEntityId}>
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
