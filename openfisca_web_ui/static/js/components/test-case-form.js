/** @jsx React.DOM */
'use strict';

var mapObject = require('map-object'),
  React = require('react');

var Entity = require('./entity');


var TestCaseForm = React.createClass({
  propTypes: {
    errors: React.PropTypes.object,
    onAddIndividu: React.PropTypes.func.isRequired,
    onDeleteEntity: React.PropTypes.func.isRequired,
    onDeleteIndividu: React.PropTypes.func.isRequired,
    onEditEntity: React.PropTypes.func.isRequired,
    onEditIndividu: React.PropTypes.func.isRequired,
    onMoveIndividu: React.PropTypes.func.isRequired,
    suggestions: React.PropTypes.object,
    testCase: React.PropTypes.object.isRequired,
  },
  render: function() {
    var familles = this.props.testCase.familles ?
      mapObject(this.props.testCase.familles, function(famille, familleId) {
        return <Entity
          errors={/*this.props.errors[familleId]*/null}
          entityName='familles'
          individuIdsByRole={famille}
          individus={this.props.testCase.individus}
          key={familleId}
          label="Famille"
          onAddIndividu={this.props.onAddIndividu}
          onDelete={this.props.onDeleteEntity}
          onDeleteIndividu={this.props.onDeleteIndividu}
          onEdit={this.props.onEditEntity}
          onEditIndividu={this.props.onEditIndividu}
          onMoveIndividu={this.props.onMoveIndividu}
          suggestions={this.props.suggestions[familleId]}
        />;
      }, this) : null;
    return (
      <div>
        {familles}
      </div>
    );
  }
});

module.exports = TestCaseForm;
