/** @jsx React.DOM */
'use strict';

var deepEqual = require('deep-equal'),
  invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react'),
  ReactIntlMixin = require('react-intl'),
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
  cx = React.addons.classSet,
  obj = helpers.obj;


var Simulator = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    baremeStepsX: React.PropTypes.number.isRequired,
    baremeVariableCode: React.PropTypes.string.isRequired,
    columns: React.PropTypes.object.isRequired,
    columnsTree: React.PropTypes.object.isRequired,
    defaultBaremeXMaxValue: React.PropTypes.number.isRequired,
    defaultBaremeXMinValue: React.PropTypes.number.isRequired,
    defaultVisualizationSlug: React.PropTypes.string.isRequired,
    disableSave: React.PropTypes.bool,
    entitiesMetadata: React.PropTypes.object.isRequired,
    visualizations: React.PropTypes.array,
  },
  componentWillMount: function() {
    webservices.fetchCurrentTestCase(data => {
      if (data && data.error) {
  //      console.error(data.error); // TODO handle error
        this.setState(Lazy(this.state).assign({testCase: null}).toObject());
      } else {
        var {testCase, testCaseAdditionalData} = data;
        if ( ! testCase) {
          testCase = models.getInitialTestCase(this.props.entitiesMetadata);
        }
        var newState = Lazy(this.state).assign({testCase, testCaseAdditionalData}).toObject();
        this.setState(newState, () => {
          this.repair(testCase, testCaseAdditionalData);
        });
      }
    });
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
      testCaseAdditionalData: null,
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
    // FIXME use withEntity
    var newEntity = models.createEntity(kind, this.props.entitiesMetadata, this.state.testCase);
    var newEntityId = uuid.v4();
    var newTestCase = helpers.assignIn(this.state.testCase, [kind, newEntityId], newEntity);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleCreateIndividuInEntity: function(kind, id, role) {
    // TODO use withIndividu
    var newIndividu = models.createIndividu(this.props.entitiesMetadata, this.state.testCase);
    var newIndividuId = uuid.v4();
    var newIndividus = Lazy(this.state.testCase.individus).assign(obj(newIndividuId, newIndividu)).toObject();
    var newTestCase = Lazy(this.state.testCase).assign({individus: newIndividus}).toObject();
    newTestCase = models.withIndividuInEntity(newIndividuId, kind, id, role, this.props.entitiesMetadata, newTestCase);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleDeleteEntity: function(kind, id) {
    var entity = this.state.testCase[kind][id];
    var entityLabel = models.getEntityLabel(kind, entity, this.props.entitiesMetadata);
    var message = `Supprimer ${entityLabel} ?`;
    if (confirm(message)) {
      var newTestCase = models.withoutEntity(kind, id, this.state.testCase);
      this.setState({testCase: newTestCase}, this.repair);
    }
  },
  handleDeleteIndividu: function(id) {
    var nameKey = this.props.entitiesMetadata.individus.nameKey;
    var name = this.state.testCase.individus[id][nameKey];
    var message = `Supprimer ${name} ?`;
    if (confirm(message)) {
      var newTestCase = models.withoutIndividu(id, this.props.entitiesMetadata, this.state.testCase);
      this.setState({testCase: newTestCase}, this.repair);
    }
  },
  handleEditEntity: function(kind, id) {
    var newEditedEntity = {action: 'edit', id: id, kind: kind};
    var nameKey = this.props.entitiesMetadata[kind].nameKey;
    newEditedEntity[nameKey] = this.state.testCase[kind][id][nameKey];
    this.setState({editedEntity: newEditedEntity});
  },
  handleEditFormClose: function() {
    var {action, id, kind} = this.state.editedEntity;
    var changeset = {editedEntity: null};
    if (action === 'edit') {
      var nameKey = this.props.entitiesMetadata[kind].nameKey;
      var newTestCase = helpers.assignIn(this.state.testCase, [kind, id, nameKey], this.state.editedEntity[nameKey]);
      changeset.testCase = newTestCase;
    }
    this.setState(changeset, this.repair);
  },
  handleFieldsFormChange: function(kind, id, column, value) {
    var nameKey = this.props.entitiesMetadata[kind].nameKey;
    if (column.name === nameKey) {
      var newEditedEntity = Lazy(this.state.editedEntity).assign(obj(column.name, value)).toObject();
      this.setState({editedEntity: newEditedEntity});
    } else {
      var newValue = column.autocomplete ? value.value : value;
      var newValues = Lazy(this.state.testCase[kind][id]).assign(obj(column.name, newValue)).toObject();
      var newTestCase = helpers.assignIn(this.state.testCase, [kind, id], newValues);
      var changeset = {testCase: newTestCase};
      if (column.autocomplete) {
        var newTestCaseAdditionalData = Lazy(this.state.testCaseAdditionalData)
          .assign(obj(column.name, value.displayedValue)).toObject();
        changeset.testCaseAdditionalData = newTestCaseAdditionalData;
      }
      this.setState(changeset);
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
    var oldEntityData = models.findEntityAndRole(movedIndividuId, kind, this.props.entitiesMetadata,
      this.state.testCase);
    var newEntityId = whatChanged === 'entity' ? value : oldEntityData.id;
    var newRole = whatChanged === 'role' ? value : oldEntityData.role;
    var newTestCase = models.moveIndividuInEntity(movedIndividuId, kind, newEntityId, newRole,
      this.props.entitiesMetadata, this.state.testCase);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleRepair: function() {
    if ( ! this.state.editedEntity) {
      this.repair();
    }
  },
  handleReset: function() {
    var message = this.getIntlMessage('resetSituationConfirmMessage');
    if (confirm(message)) {
      var initialTestCase = models.getInitialTestCase(this.props.entitiesMetadata);
      if (this.state.editedEntity) {
        this.setState({editedEntity: null});
      }
      this.repair(initialTestCase, null);
    }
  },
  handleVisualizationChange: function(slug) {
    var changeset = {visualizationSlug: slug};
    var newSimulationParams = this.simulationParams(slug),
      oldSimulationParams = this.simulationParams(this.state.visualizationSlug);
    if (deepEqual(newSimulationParams, oldSimulationParams)) {
      this.setState(changeset);
    } else {
      changeset.simulationResult = null;
      this.setState(changeset, this.simulate);
    }
  },
  handleVisualizationStateChange: function(visualizationState) {
    this.setState(obj(this.state.visualizationSlug, visualizationState));
  },
  handleYearChange: function(year) {
    this.setState({errors: null, year: year}, this.simulate);
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
        var kinds = models.getEntitiesKinds(this.props.entitiesMetadata, {persons: false});
        kinds.forEach(kind => {
          var entityData = models.findEntityAndRole(this.state.editedEntity.id, kind, this.props.entitiesMetadata,
            this.state.testCase);
          if (entityData) {
            currentEntityIdByKind[kind] = entityData.id;
            currentRoleByKind[kind] = entityData.role;
          }
        });
        var nameKey = this.props.entitiesMetadata.individus.nameKey;
        var name = this.state.testCase.individus[this.state.editedEntity.id][nameKey];
        rightPanel = (
          <EditForm
            onClose={this.handleEditFormClose}
            title={this.formatMessage(this.getIntlMessage('moveFormTitle'), {name: name})}>
            <MoveIndividuForm
              currentEntityIdByKind={currentEntityIdByKind}
              currentRoleByKind={currentRoleByKind}
              entitiesMetadata={this.props.entitiesMetadata}
              getEntitiesKinds={models.getEntitiesKinds}
              getEntityLabel={models.getEntityLabel}
              onEntityChange={this.handleMoveIndividuFormChange.bind(null, 'entity')}
              onRoleChange={this.handleMoveIndividuFormChange.bind(null, 'role')}
              testCase={this.state.testCase}
            />
          </EditForm>
        );
      }
    } else {
      rightPanel = this.renderVisualizationPanel();
    }
    return (
      <div className='row'>
        <div className={cx({
          'col-sm-4': true,
          'hidden-xs': this.state.editedEntity,
        })}>
          <TestCaseToolbar
            disableSimulate={Boolean(this.state.editedEntity || this.state.errors || this.state.isSimulationInProgress)}
            entitiesMetadata={this.props.entitiesMetadata}
            getEntitiesKinds={models.getEntitiesKinds}
            isSimulationInProgress={this.state.isSimulationInProgress}
            onCreateEntity={this.handleCreateEntity}
            onReset={this.handleReset}
            onRepair={this.handleRepair}
            onSimulate={this.simulate}
          />
          <hr/>
          {
            this.state.testCase && (
              <TestCase
                activeEntityId={this.state.editedEntity && this.state.editedEntity.id}
                entitiesMetadata={this.props.entitiesMetadata}
                errors={this.state.errors && this.state.errors.test_case /* jshint ignore:line */}
                getEntitiesKinds={models.getEntitiesKinds}
                getEntityLabel={models.getEntityLabel}
                onCloseEntity={this.handleEditFormClose}
                onCreateEntity={this.handleCreateEntity}
                onCreateIndividuInEntity={this.handleCreateIndividuInEntity}
                onDeleteEntity={this.handleDeleteEntity}
                onDeleteIndividu={this.handleDeleteIndividu}
                onEditEntity={this.handleEditEntity}
                onMoveIndividu={this.handleMoveIndividu}
                suggestions={this.state.suggestions}
                testCase={this.state.testCase}
              />
            )
          }
        </div>
        <div className="col-sm-8">
          {rightPanel}
        </div>
      </div>
    );
  },
  renderFieldsFormPanel: function() {
    var {id, kind} = this.state.editedEntity,
      entity = this.state.testCase[kind][id];
    var entityLabel = models.getEntityLabel(kind, entity, this.props.entitiesMetadata);
    invariant('children' in this.props.columnsTree[kind], `columnsTree.${kind} has no children`);
    var categories = Lazy(this.props.columnsTree[kind].children).map(category => ({
      columns: category.children ? category.children.map(columnName => {
        invariant(columnName in this.props.columns, `column "${columnName}" is not in columns prop`);
        return this.props.columns[columnName];
      }) : null,
      label: category.label,
    })).toArray(); // jshint ignore:line
    var errors = helpers.getObjectPath(this.state.errors, 'test_case', kind, id);
    var suggestions = helpers.getObjectPath(this.state.suggestions, kind, id);
    var nameKey = this.props.entitiesMetadata[kind].nameKey;
    var editedValues = obj(nameKey, this.state.editedEntity[nameKey]);
    var additionalDataValues = 'depcom' in entity ? {
      depcom: {
        displayedValue: this.state.testCaseAdditionalData.depcom,
        value: entity.depcom,
      },
    } : {};
    var values = Lazy(entity).assign(editedValues).assign(additionalDataValues).toObject();
    return (
      <EditForm
        onClose={this.handleEditFormClose}
        title={this.formatMessage(this.getIntlMessage('editFormTitle'), {name: entityLabel})}>
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
    return (
      <div>
        <VisualizationToolbar
          errors={this.state.errors}
          isSimulationInProgress={this.state.isSimulationInProgress}
          onVisualizationChange={this.handleVisualizationChange}
          onYearChange={this.handleYearChange}
          visualizationSlug={this.state.visualizationSlug}
          year={this.state.year}
        />
        <hr/>
        {
          this.state.errors ? (
            <div className="alert alert-danger" role="alert">
              <h4>{this.getIntlMessage('incorrectSituation')}</h4>
              <p>{this.getIntlMessage('incorrectSituationExplanation')}</p>
              <ul>
                <li>{this.getIntlMessage('incorrectSituationFixErrors')}</li>
                <li>
                  <button className='btn btn-danger btn-xs' onClick={this.handleReset}>
                    {this.getIntlMessage('resetSituation')}
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            this.state.simulationResult && ! this.state.isSimulationInProgress && (
              <Visualization
                baremeXMaxValue={this.state.baremeXMaxValue}
                baremeXMinValue={this.state.baremeXMinValue}
                onBaremeXValuesChange={this.handleBaremeXValuesChange}
                simulationResult={this.state.simulationResult}
                testCase={this.state.testCase}
                visualizationSlug={this.state.visualizationSlug}
              />
            )
          )
        }
      </div>
    );
  },
  repair: function(testCase, testCaseAdditionalData) {
    var originalTestCase = testCase || this.state.testCase;
    if ( ! testCaseAdditionalData) {
      testCaseAdditionalData = this.state.testCaseAdditionalData;
    }
    webservices.repair(originalTestCase, this.state.year, data => {
      var {errors, suggestions} = data,
        repairedTestCase = data.testCase;
      var changeset = {errors, suggestions};
      var saveComplete = () => {
        this.setState(changeset, () => {
          if ( ! errors) {
            this.simulate();
          }
        });
      };
      if (errors) {
        changeset.simulationResult = null;
        this.save(originalTestCase, testCaseAdditionalData, saveComplete);
      } else if (repairedTestCase) {
        var newTestCase = models.withEntitiesNamesFilled(this.props.entitiesMetadata, repairedTestCase);
        changeset.testCase = newTestCase;
        this.save(newTestCase, testCaseAdditionalData, saveComplete);
      }
    });
  },
  save: function (testCase, testCaseAdditionalData, onComplete) {
    if ( ! this.props.disableSave) {
      webservices.saveCurrentTestCase(testCase, testCaseAdditionalData, data => {
        if (data && data.unauthorized) {
          alert('Votre session a expiré. La page va être rechargée avec une situation vierge.');
          window.location.reload();
        } else {
          onComplete();
        }
      });
    }
  },
  simulate: function() {
    if ( ! this.state.isSimulationInProgress && ! this.state.errors && ! this.state.editedEntity) {
      this.setState({isSimulationInProgress: true}, () => {
        var params = this.simulationParams(this.state.visualizationSlug);
        webservices.simulate(params.axes, params.decomposition, this.state.legislationUrl, this.state.testCase,
          this.state.year, data => {
            var changeset = {isSimulationInProgress: false};
            if (data) {
              if (data.error) {
                changeset.simulationResult = {error: data.error};
              } else {
                if (data.errors) {
                  changeset.errors = data.errors;
                  changeset.simulationResult = null;
                } else {
                  changeset.errors = null;
                  changeset.simulationResult = data;
                }
              }
            }
            this.setState(changeset);
          });
      });
    }
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
