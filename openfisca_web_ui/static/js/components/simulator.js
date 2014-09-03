/** @jsx React.DOM */
'use strict';

var deepEqual = require('deep-equal'),
  invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react'),
  shallowEqual = require('react/lib/shallowEqual'),
  uuid = require('uuid');

var EditForm = require('./edit-form'),
  FieldsForm = require('./test-case/form/fields-form'),
  helpers = require('../helpers'),
  models = require('../models'),
  MoveIndividuForm = require('./test-case/move-individu-form'),
  TestCase = require('./test-case/test-case'),
  TestCaseToolbar = require('./test-case/test-case-toolbar'),
  Visualization = require('./visualization'),
  VisualizationToolbar = require('./visualizations/visualization-toolbar'),
  webservices = require('../webservices');

var appconfig = global.appconfig,
  obj = helpers.obj;


var Simulator = React.createClass({
  propTypes: {
    baremeStepsX: React.PropTypes.number.isRequired,
    baremeVariableCode: React.PropTypes.string.isRequired,
    defaultBaremeXMaxValue: React.PropTypes.number.isRequired,
    defaultBaremeXMinValue: React.PropTypes.number.isRequired,
    defaultVisualizationSlug: React.PropTypes.string.isRequired,
    visualizations: React.PropTypes.array,
  },
  componentDidMount: function() {
    window.onresize = this.handleResize;
  },
  componentWillMount: function() {
    webservices.fetchCurrentTestCase(this.currentTestCaseFetched);
    webservices.fetchFields(this.fieldsFetched);
  },
  componentWillUnmount: function() {
    window.onresize = null;
  },
  currentTestCaseFetched: function(data) {
    var newState;
    if (data && data.error) {
      console.error(data.error);
      newState = Lazy(this.state).assign({testCase: null}).toObject();
      this.setState(newState);
    } else {
      newState = Lazy(this.state).assign({testCase: data}).toObject();
      this.setState(newState, function() {
        this.repair(data || models.TestCase.getInitialTestCase());
      });
    }
  },
  fieldsFetched: function(data) {
    if (data) {
      if (data.error) {
        console.error(data.error);
      } else {
        this.setState({
          columns: data.columns,
          columnsTree: data.columnsTree,
        });
      }
    }
  },
  getDefaultProps: function() {
    return {
      baremeStepsX: 20,
      baremeVariableCode: 'sali',
      defaultBaremeXMaxValue: 20000,
      defaultBaremeXMinValue: 0,
      defaultVisualizationSlug: 'cascade',
    };
  },
  getInitialState: function() {
    return {
      baremeXMaxValue: this.props.defaultBaremeXMaxValue,
      baremeXMinValue: this.props.defaultBaremeXMinValue,
      calculationResult: null,
      editedEntity: null,
      errors: null,
      isCalculationInProgress: false,
      isSimulationInProgress: false,
      legislationUrl: null,
      simulationResult: null,
      suggestions: null,
      testCase: null,
      visualizationSlug: this.props.defaultVisualizationSlug,
      year: appconfig.constants.defaultYear,
    };
  },
  handleBaremeXValuesChange: function(minValue, maxValue) {
    this.setState({
      baremeXMaxValue: maxValue,
      baremeXMinValue: minValue,
    }, this.simulate);
  },
  handleCreateEntity: function(kind) {
    var newEntity = models.TestCase.createEntity(kind, this.state.testCase);
    var newEntityId = uuid.v4();
    var newTestCase = helpers.assignIn(this.state.testCase, [kind, newEntityId], newEntity);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleCreateIndividuInEntity: function(kind, id, role) {
    var newIndividu = models.TestCase.createIndividu(this.state.testCase);
    var newIndividuId = uuid.v4();
    var newIndividus = Lazy(this.state.testCase.individus).assign(obj(newIndividuId, newIndividu)).toObject();
    var newTestCase = Lazy(this.state.testCase).assign({individus: newIndividus}).toObject();
    newTestCase = models.TestCase.withIndividuInEntity(newIndividuId, kind, id, role, newTestCase);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleDeleteEntity: function(kind, id) {
    var entity = this.state.testCase[kind][id];
    var entityLabel = models.TestCase.getEntityLabel(kind, entity);
    var message = 'Supprimer ' + entityLabel + ' ?'; // jshint ignore:line
    if (confirm(message)) {
      var newTestCase = models.TestCase.withoutEntity(kind, id, this.state.testCase);
      this.setState({testCase: newTestCase}, function() {
        this.repair();
      });
    }
  },
  handleDeleteIndividu: function(id) {
    var message = `Supprimer ${this.state.testCase.individus[id].nom_individu} ?`; // jshint ignore:line
    if (confirm(message)) {
      var newTestCase = models.TestCase.withoutIndividu(id, this.state.testCase);
      this.setState({testCase: newTestCase}, function() {
        this.repair();
      });
    }
  },
  handleEditEntity: function(kind, id) {
    var newEditedEntity = {action: 'edit', id: id, kind: kind};
    var nameKey = models.getNameKey(kind);
    newEditedEntity[nameKey] = this.state.testCase[kind][id][nameKey];
    this.setState({editedEntity: newEditedEntity});
  },
  handleEditFormClose: function() {
    var {action, id, kind} = this.state.editedEntity;
    var changeset = {editedEntity: null};
    if (action === 'edit') {
      var nameKey = models.getNameKey(kind);
      var newTestCase = helpers.assignIn(this.state.testCase, [kind, id, nameKey], this.state.editedEntity[nameKey]);
      changeset.testCase = newTestCase;
    }
    this.setState(changeset, this.repair);
  },
  handleFieldsFormChange: function(kind, id, columnName, value) {
    var nameKey = models.getNameKey(kind);
    if (columnName === nameKey) {
      var newEditedEntity = Lazy(this.state.editedEntity).assign(obj(columnName, value)).toObject();
      this.setState({editedEntity: newEditedEntity});
    } else {
      var newValues = Lazy(this.state.testCase[kind][id]).assign(obj(columnName, value)).toObject();
      var newTestCase = helpers.assignIn(this.state.testCase, [kind, id], newValues);
      this.setState({testCase: newTestCase}, ! this.state.editedEntity && this.repair);
    }
  },
  handleMoveIndividu: function(id) {
    var newEditedEntity = {action: 'move', id: id, kind: 'individus'};
    this.setState({
      editedEntity: this.state.editedEntity && shallowEqual(this.state.editedEntity, newEditedEntity) ?
        null : newEditedEntity,
    });
  },
  handleMoveIndividuFormChange: function(whatChanged, kind, value) {
    invariant(this.state.editedEntity, 'handler called without editedEntity in state.');
    var movedIndividuId = this.state.editedEntity.id;
    var oldEntityData = models.TestCase.findEntityAndRole(movedIndividuId, kind, this.state.testCase);
    var newEntityId = whatChanged === 'entity' ? value : oldEntityData.id;
    var newRole = whatChanged === 'role' ? value : oldEntityData.role;
    var newTestCase = models.TestCase.moveIndividuInEntity(movedIndividuId, kind, newEntityId, newRole,
      this.state.testCase);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleRepair: function() {
    if ( ! this.state.editedEntity) {
      this.repair();
    }
  },
  handleReset: function() {
    var message = 'Réinitialiser la situation ? Ceci effacera définitivement les entités et les individus renseignés.'; // jshint ignore:line
    if (confirm(message)) {
      var initialTestCase = models.TestCase.getInitialTestCase();
      if (this.state.editedEntity) {
        this.setState({editedEntity: null});
      }
      this.repair(initialTestCase);
    }
  },
  handleResize: function() {
    this.forceUpdate();
  },
  handleVisualizationChange: function(slug) {
    var changeset = {visualizationSlug: slug};
    var newSimulationParams = this.simulationParams(slug),
      oldSimulationParams = this.simulationParams(this.state.visualizationSlug);
    if (deepEqual(newSimulationParams, oldSimulationParams)) {
      this.setState(changeset);
    } else {
      changeset.simulationResult = null;
      this.setState(changeset, function() {
        this.simulate();
      });
    }
  },
  handleVisualizationStateChange: function(visualizationState) {
    this.setState(obj(this.state.visualizationSlug, visualizationState));
  },
  handleYearChange: function(year) {
    this.setState({year: year}, this.simulate);
  },
  render: function() {
    var rightPanel;
    if (this.state.editedEntity) {
      if (this.state.editedEntity.action === 'edit') {
        rightPanel = this.renderFieldsFormPanel();
      } else {
        invariant(this.state.editedEntity.action === 'move', 'editedEntity.action is either "edit" or "move"');
        var currentEntityIdByKind = {},
          currentRoleByKind = {};
        models.kinds.forEach(kind => {
          var entityData = models.TestCase.findEntityAndRole(this.state.editedEntity.id, kind, this.state.testCase);
          if (entityData) {
            currentEntityIdByKind[kind] = entityData.id;
            currentRoleByKind[kind] = entityData.role;
          }
        });
        rightPanel = (
          <EditForm
            onClose={this.handleEditFormClose}
            title={
              'Déplacer ' + this.state.testCase.individus[this.state.editedEntity.id].nom_individu /* jshint ignore:line */
            }>
            <MoveIndividuForm
              currentEntityIdByKind={currentEntityIdByKind}
              currentRoleByKind={currentRoleByKind}
              entitiesMetadata={models.entitiesMetadata}
              getEntityLabel={models.TestCase.getEntityLabel}
              onEntityChange={this.handleMoveIndividuFormChange.bind(null, 'entity')}
              onRoleChange={this.handleMoveIndividuFormChange.bind(null, 'role')}
              roleLabels={models.roleLabels}
              testCase={this.state.testCase}
            />
          </EditForm>
        );
      }
    } else {
      rightPanel = this.renderVisualizationPanel();
    }
    return (
      <div className="row">
        <div className="col-sm-4">
          <TestCaseToolbar
            disableSimulate={Boolean(this.state.editedEntity || this.state.errors || this.state.isSimulationInProgress)}
            isSimulationInProgress={this.state.isSimulationInProgress}
            onCreateEntity={this.handleCreateEntity}
            onReset={this.handleReset}
            onRepair={this.handleRepair}
            onSimulate={this.simulate}
          />
          <hr/>
          {
            this.state.testCase &&
            <TestCase
              activeEntityId={this.state.editedEntity && this.state.editedEntity.id}
              entitiesMetadata={models.entitiesMetadata}
              errors={this.state.errors}
              getEntityLabel={models.TestCase.getEntityLabel}
              onCloseEntity={this.handleEditFormClose}
              onCreateEntity={this.handleCreateEntity}
              onCreateIndividuInEntity={this.handleCreateIndividuInEntity}
              onDeleteEntity={this.handleDeleteEntity}
              onDeleteIndividu={this.handleDeleteIndividu}
              onEditEntity={this.state.columns && this.state.columnsTree && this.handleEditEntity}
              onMoveIndividu={this.handleMoveIndividu}
              roleLabels={models.roleLabels}
              suggestions={this.state.suggestions}
              testCase={this.state.testCase}
            />
          }
        </div>
        <div className="col-sm-8" ref='rightPanel'>
          {rightPanel}
        </div>
      </div>
    );
  },
  renderFieldsFormPanel: function() {
    var {id, kind} = this.state.editedEntity,
      entity = this.state.testCase[kind][id];
    var entityLabel = models.TestCase.getEntityLabel(kind, entity);
    invariant('children' in this.state.columnsTree[kind], `columnsTree.${kind} has no children`);
    var categories = Lazy(this.state.columnsTree[kind].children).map(category => ({
      columns: category.children ? category.children.map(columnName => {
        invariant(columnName in this.state.columns, `column "${columnName}" is not in columns prop`);
        return this.state.columns[columnName];
      }) : null,
      label: category.label,
    })).toArray(); // jshint ignore:line
    var errors = helpers.getObjectPath(this.state.errors, kind, id);
    var suggestions = helpers.getObjectPath(this.state.suggestions, kind, id);
    var nameKey = models.getNameKey(kind);
    var editedValues = obj(nameKey, this.state.editedEntity[nameKey]);
    var values = Lazy(entity).assign(editedValues).toObject();
    return (
      <EditForm
        onClose={this.handleEditFormClose}
        title={'Éditer ' + entityLabel}>
        <FieldsForm
          categories={categories}
          errors={errors}
          onChange={this.handleFieldsFormChange.bind(null, kind, id)}
          suggestions={suggestions}
          values={values}
        />
      </EditForm>
    );
  },
  renderVisualizationPanel: function() {
    return this.state.errors ? (
      <div className="alert alert-danger" role="alert">
        <h4>Situation incorrecte</h4>
        <p>Certaines entités comportent des erreurs. Veuillez les corriger pour rétablir la simulation.</p>
        <p>
          Vous pouvez également {
            <button className='btn btn-danger btn-xs' onClick={this.handleReset}>réinitialiser</button>
          } la situation.
        </p>
      </div>
    ) : (
      <div>
        <VisualizationToolbar
          onVisualizationChange={this.handleVisualizationChange}
          onYearChange={this.handleYearChange}
          visualizationSlug={this.state.visualizationSlug}
          year={this.state.year}
        />
        <hr/>
        {
          this.state.simulationResult && (
            <Visualization
              baremeXMaxValue={this.state.baremeXMaxValue}
              baremeXMinValue={this.state.baremeXMinValue}
              onBaremeXValuesChange={this.handleBaremeXValuesChange}
              simulationResult={this.state.simulationResult}
              visualizationPanelWidth={this.refs.rightPanel.getDOMNode().clientWidth}
              visualizationSlug={this.state.visualizationSlug}
            />
          )
        }
      </div>
    );
  },
  repair: function(testCase) {
    webservices.repair(testCase || this.state.testCase, this.state.year, this.repairCompleted);
  },
  repairCompleted: function(data) {
    var errors = data.errors,
      originalTestCase = data.originalTestCase,
      suggestions = data.suggestions,
      testCase = data.testCase;
    var changeset = {
      errors: errors,
      suggestions: suggestions,
    };
    if (errors) {
      changeset.simulationResult = null;
      if (originalTestCase) {
        webservices.saveCurrentTestCase(originalTestCase);
      }
    } else if (testCase) {
      var newTestCase = models.TestCase.withEntitiesNamesFilled(testCase);
      changeset.testCase = newTestCase;
      webservices.saveCurrentTestCase(newTestCase);
    }
    this.setState(changeset, function() {
      if ( ! this.state.errors) {
        this.simulate();
      }
    });
  },
  simulate: function() {
    if ( ! this.state.isSimulationInProgress && ! this.state.errors && ! this.state.editedEntity) {
      this.setState({isSimulationInProgress: true}, () => {
        var params = this.simulationParams(this.state.visualizationSlug);
        webservices.simulate(params.axes, params.decomposition, this.state.legislationUrl, this.state.testCase,
          this.state.year, this.simulationCompleted);
      });
    }
  },
  simulationCompleted: function(data) {
    var changeset = {isSimulationInProgress: false};
    if (data) {
      if (data.error) {
        console.error(data.error);
        changeset.simulationResult = {error: data.error};
      } else {
        changeset.errors = data.errors ? data.errors : null;
        changeset.simulationResult = data;
      }
    }
    this.setState(changeset);
  },
  simulationParams: function(visualizationSlug) {
    var params = {
      axes: visualizationSlug === 'bareme' ? [
        {
          count: this.props.baremeStepsX,
          max: this.state.baremeXMaxValue,
          min: this.state.baremeXMinValue,
          name: this.props.baremeVariableCode,
        },
      ] : null,
      decomposition: null,
    };
    if (visualizationSlug === 'situateur-revdisp') {
      params.decomposition = ['revdisp'];
    } else if (visualizationSlug === 'situateur-sal') {
      params.decomposition = ['sal'];
    }
    return params;
  },
});

module.exports = Simulator;
