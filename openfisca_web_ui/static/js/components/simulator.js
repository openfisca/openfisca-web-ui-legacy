/** @jsx React.DOM */
'use strict';

var find = require('lodash.find'),
  getObjectPath = require('get-object-path'),
  invariant = require('react/lib/invariant'),
  mapObject = require('map-object'),
  React = require('react/addons'),
  uuid = require('uuid');

var FieldsForm = require('./fields/fields-form'),
  IframeVisualization = require('./visualizations/iframe-visualization'),
  JsonVisualization = require('./visualizations/json-visualization'),
  models = require('../models'),
  MoveIndividuForm = require('./move-individu-form'),
  TestCaseForm = require('./test-case/test-case-form'),
  TestCaseToolbar = require('./test-case/test-case-toolbar'),
  VisualizationToolbar = require('./visualizations/visualization-toolbar'),
  webservices = require('../webservices');

var appconfig = global.appconfig;


var Simulator = React.createClass({
  propTypes: {
    columns: React.PropTypes.object,
    columnsTree: React.PropTypes.object,
    legislations: React.PropTypes.array,
    visualizations: React.PropTypes.array,
  },
  componentWillMount: function() {
    webservices.fetchCurrentTestCase(this.currentTestCaseFetched);
    webservices.fetchFields(this.fieldsFetched);
    webservices.fetchLegislations(this.legislationsFetched);
    webservices.fetchVisualizations(this.visualizationsFetched);
  },
  currentTestCaseFetched: function(data) {
    console.debug('currentTestCaseFetched', data);
    var newState;
    if (data && data.error) {
      console.error(data.error);
      newState = React.addons.update(this.state, {testCase: {$set: null}});
      this.setState(newState);
    } else {
      newState = React.addons.update(this.state, {testCase: {$set: data}});
      this.setState(newState, function() {
        this.repair(data || models.TestCase.getInitialTestCase());
      });
    }
  },
  currentTestCaseSaved: function(data) {
    console.debug('currentTestCaseSaved', data);
  },
  fieldsFetched: function(data) {
    console.debug('fieldsFetched', data);
    if (data) {
      if (data.error) {
        console.error(data.error);
      } else {
        var spec = {
          columns: {$set: data.columns},
          columnsTree: {$set: data.columnsTree},
        };
        var newProps = React.addons.update(this.props, spec);
        this.setProps(newProps);
      }
    }
  },
  getInitialState: function() {
    return {
      editedEntity: null,
      errors: null,
      isSimulationInProgress: false,
      legislationUrl: null,
      movedIndividu: null,
      simulationResult: null,
      suggestions: null,
      testCase: null,
      visualizationSlug: null,
      year: appconfig.constants.defaultYear,
    };
  },
  handleCreateEntity: function(kind) {
    console.debug('handleCreateEntity', kind);
    var newEntity = models.TestCase.createEntity(kind, this.state.testCase);
    var newEntities = {};
    newEntities[uuid.v4()] = newEntity;
    var spec = {testCase: {}};
    spec.testCase[kind] = {$merge: newEntities};
    var newState = React.addons.update(this.state, spec);
    this.setState(newState, function() {
      this.repair();
    });
  },
  handleCreateIndividuInEntity: function(kind, id, role) {
    console.debug('handleCreateIndividuInEntity', kind, id, role);
    var newIndividu = models.TestCase.createIndividu(this.state.testCase);
    var newIndividus = {};
    var newIndividuId = uuid.v4();
    newIndividus[newIndividuId] = newIndividu;
    var spec = {};
    spec.individus = {$merge: newIndividus};
    var newTestCase = React.addons.update(this.state.testCase, spec);
    newTestCase = models.TestCase.withIndividuInEntity(newIndividuId, kind, id, role, newTestCase);
    var newState = React.addons.update(this.state, {testCase: {$set: newTestCase}});
    this.setState(newState, function() {
      this.repair();
    });
  },
  handleDeleteEntity: function(kind, id) {
    console.debug('handleDeleteEntity', kind, id);
    var entity = this.state.testCase[kind][id];
    var entityLabel = models.TestCase.getEntityLabel(kind, entity);
    var message = 'Supprimer ' + entityLabel + ' ?'; // jshint ignore:line
    if (confirm(message)) {
      var newTestCase = models.TestCase.withoutEntity(kind, id, this.state.testCase);
      var newState = React.addons.update(this.state, {testCase: {$set: newTestCase}});
      this.setState(newState, function() {
        this.repair();
      });
    }
  },
  handleDeleteIndividu: function(id) {
    console.debug('handleDeleteIndividu', id);
    var message = 'Supprimer ' + this.state.testCase.individus[id].nom_individu + ' ?'; // jshint ignore:line
    if (confirm(message)) {
      var newTestCase = models.TestCase.withoutIndividu(id, this.state.testCase);
      var newState = React.addons.update(this.state, {testCase: {$set: newTestCase}});
      this.setState(newState, function() {
        this.repair();
      });
    }
  },
  handleEditEntity: function(kind, id) {
    console.debug('handleEditEntity', kind, id);
    if (this.props.columns && this.props.columnsTree) {
      var editedEntity = {id: id, kind: kind};
      var newState = React.addons.update(this.state, {editedEntity: {$set: editedEntity}});
      this.setState(newState);
    } else {
      alert('Impossible de charger les champs du formulaire');
    }
  },
  handleFieldsFormCancel: function() {
    console.debug('handleFieldsFormCancel');
    var newState = React.addons.update(this.state, {editedEntity: {$set: null}});
    this.setState(newState);
  },
  handleFieldsFormChange: function(kind, id, columnName, value) {
    console.debug('handleFieldsFormChange', kind, id, columnName, value);
    // Create values empty object in editedEntity if it doesn't exist.
    var state = this.state.editedEntity.values ? this.state :
      React.addons.update(this.state, {editedEntity: {values: {$set: {}}}});
    // Write in this.state.editedEntity.values only values that actually changed. The other stay in this.state.testCase.
    var spec = {editedEntity: {values: {}}};
    spec.editedEntity.values[columnName] = {$set: value};
    var newState = React.addons.update(state, spec);
    this.setState(newState);
  },
  handleFieldsFormSave: function() {
    console.debug('handleFieldsFormSave');
    var spec = {
      editedEntity: {$set: null},
    };
    var id = this.state.editedEntity.id,
      kind = this.state.editedEntity.kind,
      values = this.state.editedEntity.values;
    if (values && Object.keys(values).length) {
      spec.testCase = {};
      spec.testCase[kind] = {};
      spec.testCase[kind][id] = {$merge: values};
    }
    var newState = React.addons.update(this.state, spec);
    this.setState(newState, function() {
      this.repair();
    });
  },
  handleLegislationChange: function(legislationUrl) {
    var newState = React.addons.update(this.state, {legislationUrl: {$set: legislationUrl}});
    this.setState(newState, function() {
      this.simulate();
    });
  },
  handleMoveIndividu: function(id) {
    console.debug('handleMoveIndividu', id);
    var editedEntity = this.state.editedEntity;
    invariant(editedEntity === null, 'editedEntity: %s when requesting move individu action.', editedEntity);
    var movedIndividu = {id: id};
    var newState = React.addons.update(this.state, {movedIndividu: {$set: movedIndividu}});
    this.setState(newState);
  },
  handleMoveIndividuFormCancel: function() {
    console.debug('handleMoveIndividuFormCancel');
    var newState = React.addons.update(this.state, {movedIndividu: {$set: null}});
    this.setState(newState);
  },
  handleMoveIndividuFormChange: function(individuId, entityKind, entityId) {
    console.debug('handleMoveIndividuFormChange', individuId, entityKind, entityId);
  },
  handleMoveIndividuFormSave: function() {
    console.debug('handleMoveIndividuFormSave');
  },
  handleRepair: function() {
    console.debug('handleRepair');
    this.repair();
  },
  handleReset: function() {
    console.debug('handleReset');
    if (confirm('Réinitialiser la situation ?')) { // jshint ignore:line
      var initialTestCase = models.TestCase.getInitialTestCase();
      this.repair(initialTestCase);
    }
  },
  handleVisualizationChange: function(slug) {
    var newState = React.addons.update(this.state, {visualizationSlug: {$set: slug}});
    this.setState(newState, function() {
      this.simulate();
    });
  },
  handleYearChange: function(year) {
    console.debug('handleYearChange', year);
    var newState = React.addons.update(this.state, {year: {$set: year}});
    this.setState(newState, function() {
      this.simulate();
    });
  },
  legislationsFetched: function(data) {
    console.debug('legislationsFetched', data);
    if (data) {
      if (data.error) {
        console.error(data.error);
      } else if (data.length) {
        var newProps = React.addons.update(this.props, {legislations: {$set: data}});
        this.setProps(newProps);
        var newState = React.addons.update(this.state, {legislationSlug: {$set: data[0].slug}});
        this.setState(newState);
      }
    }
  },
  render: function() {
    var rightPanel = this.state.editedEntity ?
      this.renderFieldsFormPanel() : (
        this.state.movedIndividu ? (
          <MoveIndividuForm
            onCancel={this.handleMoveIndividuFormCancel}
            onChange={this.handleMoveIndividuFormChange.bind(null, this.state.movedIndividu.id)}
            onSave={this.handleMoveIndividuFormSave}
            title={this.state.testCase.individus[this.state.movedIndividu.id].nom_individu /* jshint ignore:line */}
          />
        ) : this.renderVisualizationPanel()
      );
    return (
      <div className="row">
        <div className="col-sm-4">
          <TestCaseToolbar
            disabled={ !! this.state.editedEntity}
            hasErrors={ !! this.state.errors}
            isSimulationInProgress={this.state.isSimulationInProgress}
            onCreateEntity={this.handleCreateEntity}
            onReset={this.handleReset}
            onRepair={this.handleRepair}
            onSimulate={this.simulate}
          />
          <hr/>
          {
            this.state.testCase ?
              <TestCaseForm
                editedEntity={this.state.editedEntity}
                errors={this.state.errors}
                onCreateIndividuInEntity={this.handleCreateIndividuInEntity}
                onDeleteEntity={this.handleDeleteEntity}
                onDeleteIndividu={this.handleDeleteIndividu}
                onEditEntity={this.handleEditEntity}
                onMoveIndividu={this.handleMoveIndividu}
                suggestions={this.state.suggestions}
                testCase={this.state.testCase}
              />
              : null
          }
        </div>
        <div className="col-sm-8">
          {rightPanel}
        </div>
      </div>
    );
  },
  renderFieldsFormPanel: function() {
    var id = this.state.editedEntity.id,
      kind = this.state.editedEntity.kind;
    var entity = this.state.testCase[kind][id];
    var title = kind === 'individus' ?
      entity.nom_individu : // jshint ignore:line
      models.TestCase.getEntityLabel(kind, entity);
    invariant('children' in this.props.columnsTree[kind], 'columnsTree.' + kind + ' has no children');
    var categories = mapObject(this.props.columnsTree[kind].children, function(category) {
      return {
        columns: category.children ? category.children.map(function(columnName) {
          invariant(columnName in this.props.columns, 'column "' + columnName + '" is not in columns prop');
          return this.props.columns[columnName];
        }, this) : null,
        label: category.label,
      };
    }, this);
    var errors = getObjectPath(this.state.errors, kind + '.' + id);
    var suggestions = getObjectPath(this.state.suggestions, kind + '.' + id);
    var values = this.state.testCase[kind][id];
    if (this.state.editedEntity.values) {
      values = React.addons.update(values, {$merge: this.state.editedEntity.values});
    }
    return (
      <FieldsForm
        categories={categories}
        errors={errors}
        onCancel={this.handleFieldsFormCancel}
        onChange={this.handleFieldsFormChange.bind(null, kind, id)}
        onSave={this.handleFieldsFormSave}
        suggestions={suggestions}
        title={title}
        values={values}
      />
    );
  },
  renderVisualization: function() {
    invariant(this.state.simulationResult, 'this.state.simulationResult is empty');
    if (this.state.simulationResult.error) {
      return (
        <p className="text-danger">
          Erreur de simulation sur le serveur, veuillez nous excuser.
          L'équipe technique vient d'être prévenue par un email automatique.
        </p>
      );
    } else {
      if (this.state.visualizationSlug === 'json') {
        return <JsonVisualization data={this.state.simulationResult} />;
      } else if ( ! this.props.visualizations) {
        return <p className="text-danger">Aucune visualisation disponible.</p>;
      } else {
        var visualization = find(this.props.visualizations, {slug: this.state.visualizationSlug});
        invariant(visualization, 'selected visualization not found in vizualisations prop');
        invariant(visualization.iframeSrcUrl, 'selected visualization has no iframeSrcUrl');
        return <IframeVisualization
          height="500"
          legislationUrl={this.state.legislationUrl}
          testCaseUrl={visualization.testCaseUrl}
          url={visualization.iframeSrcUrl}
          width="600"
          year={this.state.year}
        />;
      }
    }
  },
  renderVisualizationPanel: function() {
    return (
      <div>
        <VisualizationToolbar
          legislation={this.state.legislationUrl}
          legislations={this.props.legislations}
          onLegislationChange={this.handleLegislationChange}
          onVisualizationChange={this.handleVisualizationChange}
          onYearChange={this.handleYearChange}
          visualizations={this.props.visualizations}
          visualizationSlug={this.state.visualizationSlug}
          year={this.state.year}
        />
        <hr/>
        {
          this.state.simulationResult ? this.renderVisualization() : (
            this.state.errors ?
              <p>Erreurs dans le formulaire</p>
              : null
          )
        }
      </div>
    );
  },
  repair: function(testCase) {
    console.debug('repair', testCase);
    webservices.repair(testCase || this.state.testCase, this.state.year, this.repairCompleted);
  },
  repairCompleted: function(data) {
    console.debug('repairCompleted', data);
    var errors = data.errors,
      originalTestCase = data.originalTestCase,
      suggestions = data.suggestions,
      testCase = data.testCase;
    var spec = {
      errors: {$set: errors},
      suggestions: {$set: suggestions},
    };
    if (errors) {
      spec.simulationResult = {$set: null};
      if (originalTestCase) {
        webservices.saveCurrentTestCase(originalTestCase, this.currentTestCaseSaved);
      }
    } else if (testCase) {
      var newTestCase = models.TestCase.withEntitiesNamesFilled(testCase);
      spec.testCase = {$set: newTestCase};
      webservices.saveCurrentTestCase(newTestCase, this.currentTestCaseSaved);
    }
    var newState = React.addons.update(this.state, spec);
    this.setState(newState, function() {
      if ( ! this.state.errors) {
        this.simulate();
      }
    });
  },
  simulate: function() {
    console.debug('simulate');
    if ( ! this.state.isSimulationInProgress && ! this.state.errors) {
      var newState = React.addons.update(this.state, {isSimulationInProgress: {$set: true}});
      this.setState(newState, function() {
        webservices.simulate(this.state.legislationUrl, this.state.testCase, this.state.year,
          this.simulationCompleted);
      });
    }
  },
  simulationCompleted: function(data) {
    console.debug('simulationCompleted', data);
    var spec = {
      isSimulationInProgress: {$set: false},
    };
    if (data) {
      if (data.error) {
        console.error(data.error);
        spec.simulationResult = {$set: {error: data.error}};
      } else {
        spec.errors = {$set: data.errors ? data.errors : null};
        spec.simulationResult = {$set: data};
      }
    }
    var newState = React.addons.update(this.state, spec);
    this.setState(newState);
  },
  visualizationsFetched: function(data) {
    console.debug('visualizationsFetched', data);
    if (data) {
      if (data.error) {
        console.error(data.error);
      } else {
        if (data.length) {
          var newProps = React.addons.update(this.props, {visualizations: {$set: data}});
          this.setProps(newProps);
        }
        var spec = {visualizationSlug: {$set: data.length ? data[0].slug : 'json'}};
        var newState = React.addons.update(this.state, spec);
        this.setState(newState);
      }
    }
  },
});

module.exports = Simulator;
