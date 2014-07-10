/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react');


var MoveIndividuForm = React.createClass({
  propTypes: {
    entitiesMetadata: React.PropTypes.object.isRequired,
    getEntityLabel: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    roleLabels: React.PropTypes.object.isRequired,
    selectedByKind: React.PropTypes.object.isRequired,
    testCase: React.PropTypes.object.isRequired,
  },
  handleEntityChange: function(kind, event) {
    var entityId = event.target.value;
    var oldRole = this.props.selectedByKind[kind].role;
    var changes = {};
//    Lazy(this.props.selectedByKind).merge(changes);
//    this.props.onChange();
  },
  handleRoleChange: function(event) {
    this.props.onChange(event.target.value);
  },
  render: function() {
    return (
      <div>
        {
          Lazy(this.props.entitiesMetadata).map(function(entity, kind) {
            return (
              <div className='form-group' key={kind}>
                <label className='control-label' forHtml={kind}>{entity.label}</label>
                <div className='row'>
                  <div className='col-sm-6'>
                    <select
                      className="form-control"
                      id={kind}
                      onChange={this.handleEntityChange.bind(null, kind)}
                      value={this.props.selectedByKind[kind].id}>
                      {
                        Lazy(this.props.testCase[kind]).map(function(entity, entityId) {
                          return (
                            <option key={entityId} value={entityId}>{this.props.getEntityLabel(kind, entity)}</option>
                          );
                        }.bind(this)).toArray()
                      }
                    </select>
                  </div>
                  <div className='col-sm-6'>
                    <select
                      className="form-control"
                      onChange={this.handleRoleChange}
                      value={this.props.selectedByKind[kind].role}>
                      {
                        Lazy(entity.roles).map(function(role) {
                          return (
                            <option key={role} value={role}>{this.props.roleLabels[role]}</option>
                          );
                        }.bind(this)).toArray()
                      }
                    </select>
                  </div>
                </div>
              </div>
            );
          }.bind(this)).toArray()
        }
      </div>
    );
  }
});

module.exports = MoveIndividuForm;
