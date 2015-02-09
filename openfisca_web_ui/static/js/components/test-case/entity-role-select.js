/** @jsx React.DOM */
'use strict';

var React = require('react');


var EntityRoleSelect = React.createClass({
  propTypes: {
    currentEntityId: React.PropTypes.string,
    currentRole: React.PropTypes.string,
    entities: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
      })
    ).isRequired,
    kind: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    onEntityChange: React.PropTypes.func.isRequired,
    onRoleChange: React.PropTypes.func.isRequired,
    roles: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
      })
    ).isRequired,
  },
  handleEntityChange(event) {
    var newEntityId = event.target.value;
    this.props.onEntityChange(newEntityId);
  },
  handleRoleChange(event) {
    var newRole = event.target.value;
    this.props.onRoleChange(newRole);
  },
  render() {
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
                this.props.entities.map(entity =>
                  <option key={entity.id} value={entity.id}>{entity.label}</option>
                )
              }
            </select>
          </div>
          <div className='col-sm-6'>
            <select
              className="form-control"
              onChange={this.handleRoleChange}
              value={this.props.currentRole}>
              {
                this.props.roles.map(role =>
                  <option key={role.id} value={role.id}>{role.label}</option>
                )
              }
            </select>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = EntityRoleSelect;
