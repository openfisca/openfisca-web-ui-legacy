/** @jsx React.DOM */
'use strict';

var React = require('react');


var EntityRoleSelector = React.createClass({
  propTypes: {
    currentEntityId: React.PropTypes.string,
    currentRole: React.PropTypes.string,
    entities: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    kind: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    onEntityChange: React.PropTypes.func.isRequired,
    onRoleChange: React.PropTypes.func.isRequired,
    roles: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
  },
  handleEntityChange: function(event) {
    var newEntityId = event.target.value;
    this.props.onEntityChange(newEntityId);
  },
  handleRoleChange: function(event) {
    var newRole = event.target.value;
    this.props.onRoleChange(newRole);
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
              value={this.props.currentEntityId}>
              {this.props.currentEntityId ? null : <option key='none' value='none'>Aucun</option>}
              {
                this.props.entities.map(function(entity) {
                  return (
                    <option key={entity.id} value={entity.id}>{entity.label}</option>
                  );
                }, this)
              }
            </select>
          </div>
          <div className='col-sm-6'>
            <select
              className="form-control"
              onChange={this.handleRoleChange}
              value={this.props.currentRole}>
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
