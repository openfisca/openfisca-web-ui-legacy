
import {Component} from 'react'

export default class EntityRoleSelect extends Component {
  propTypes: {
    currentEntityId: React.PropTypes.string.isRequired,
    currentRole: React.PropTypes.string.isRequired,
    entityIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    kind: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    onEntityChange: React.PropTypes.func.isRequired,
    onRoleChange: React.PropTypes.func.isRequired,
    roles: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        isFull: React.PropTypes.bool,
        label: React.PropTypes.string.isRequired,
        value: React.PropTypes.string.isRequired,
      })
    ).isRequired,
  }
  handleEntityChange(event) {
    var newEntityId = event.target.value;
    this.props.onEntityChange(newEntityId);
  }
  handleRoleChange(event) {
    var newRole = event.target.value;
    this.props.onRoleChange(newRole);
  }
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
              value={this.props.currentEntityId}
            >
              {this.props.currentEntityId === 'none' && <option key='none' value='none'>Aucun</option>}
              {this.props.entityIds.map(entityId => <option key={entityId} value={entityId}>{entityId}</option>)}
            </select>
          </div>
          <div className='col-sm-6'>
            <select
              className="form-control"
              disabled={this.props.currentEntityId === 'none'}
              onChange={this.handleRoleChange}
              value={this.props.currentRole}
            >
              {
                this.props.currentRole === 'none' && (
                  <option key='none' value='none'>Aucun</option>
                )
              }
              {
                this.props.roles.map((role) =>
                  <option
                    disabled={role.isFull && role.value !== this.props.currentRole}
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                )
              }
            </select>
          </div>
        </div>
      </div>
    );
  }
}
