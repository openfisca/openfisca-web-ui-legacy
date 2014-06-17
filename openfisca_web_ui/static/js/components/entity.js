/** @jsx React.DOM */
'use strict';

var React = require('react');

var Individu = require('./individu');


var Entity = React.createClass({
  propTypes: {
    entityName: React.PropTypes.string.isRequired,
    errors: React.PropTypes.object,
    individuIdsByRole: React.PropTypes.object.isRequired,
    individus: React.PropTypes.object.isRequired,
    label: React.PropTypes.string.isRequired,
    onAddIndividu: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func.isRequired,
    onEditIndividu: React.PropTypes.func.isRequired,
    onMoveIndividu: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
  },
  render: function() {
    var parents = this.props.individuIdsByRole.parents ? this.renderRole('parents', 'Parents') : null;
    var enfants = this.props.individuIdsByRole.enfants ? this.renderRole('enfants', 'Enfants') : null;
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="btn-group">
            <button className="btn btn-default btn-sm" onClick={this.props.onEdit} type="button">
              {this.props.label}
            </button>
            <button
              className="btn btn-default btn-sm dropdown-toggle"
              data-toggle="dropdown"
              type="button">
              <span className="caret"></span>
              <span className="sr-only">Toggle Dropdown</span>
            </button>
            <ul className="dropdown-menu" role="menu">
              <li><a href="#" onClick={this.props.onDelete}>Supprimer</a></li>
            </ul>
          </div>
        </div>
        <div className="list-group">
          {parents}
          {enfants}
        </div>
      </div>
    );
  },
  renderRole: function(roleName, label) {
    return (
      <div className="list-group-item">
        <p>{label}</p>
        {/* this.props.errors ? <p className="text-danger">{{.error}}</p> : null */}
        <ul>
          {
            this.props.individuIdsByRole[roleName].map(function(individuId) {
              return (
                <li key={individuId}>
                  <Individu
                    onDelete={this.props.onDeleteIndividu}
                    onEdit={this.props.onEditIndividu}
                    onMove={this.props.onMoveIndividu}
                    value={this.props.individus[individuId]}
                  />
                </li>
              );
            }, this)
          }
          <li>
            <a href="#" onClick={this.props.onAddIndividu.bind(null, this.props.entityName, roleName)}>Ajouter</a>
          </li>
        </ul>
      </div>
    );
  },
});

module.exports = Entity;
