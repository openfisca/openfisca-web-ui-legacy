/** @jsx React.DOM */
'use strict';

var toCsv = require('to-csv'),
  deepEqual = require('deep-equal'),
  invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react'),
  ReactIntlMixin = require('react-intl'),
  saveAs = require('filesaver.js'),
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
  webservices = require('../webservices');

var appconfig = global.appconfig,
  cx = React.addons.classSet,
  obj = helpers.obj;


var Simulator = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    columns: React.PropTypes.object.isRequired,
    columnsTree: React.PropTypes.object.isRequired,
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
      defaultPropsByVisualizationSlug: {
        bareme: {
          baremeStepsX: 200,
          displayBisectrix: false,
          displaySettings: false,
          isChartFullWidth: false,
          xAxisVariableCode: 'sali',
          xMaxValue: 20000,
          xMinValue: 0,
        },
        waterfall: {
          displaySettings: false,
        },
      },
      defaultVisualizationSlug: 'waterfall',
    };
  },
  getInitialState: function() {
    return {
      editedEntity: null,
      errors: null,
      isSimulationInProgress: false,
      legislationUrl: null,
      reform: null,
      simulationResult: null,
      suggestions: null,
      testCase: null,
      testCaseAdditionalData: null,
      visualizationsSettings: {
        bareme: {
          collapsedVariables: {},
          displayBisectrix: this.props.defaultPropsByVisualizationSlug.bareme.displayBisectrix,
          displaySettings: this.props.defaultPropsByVisualizationSlug.bareme.displaySettings,
          isChartFullWidth: this.props.defaultPropsByVisualizationSlug.bareme.isChartFullWidth,
          xAxisVariableCode: this.props.defaultPropsByVisualizationSlug.bareme.xAxisVariableCode,
          xMaxValue: this.props.defaultPropsByVisualizationSlug.bareme.xMaxValue,
          xMinValue: this.props.defaultPropsByVisualizationSlug.bareme.xMinValue,
        },
        waterfall: {
          collapsedVariables: {},
          displaySettings: this.props.defaultPropsByVisualizationSlug.waterfall.displaySettings,
          isChartFullWidth: false,
        },
      },
      visualizationSlug: this.props.defaultVisualizationSlug,
      year: appconfig.constants.defaultYear,
    };
  },
  handleCollapsedVariablesChange: function(variableCode, newStatus) {
    var newVisualizationsSettings = helpers.assignIn(this.state.visualizationsSettings,
      ['shared', 'collapsedVariables', variableCode], newStatus);
    this.setState({visualizationsSettings: newVisualizationsSettings});
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
    var message = this.formatMessage(this.getIntlMessage('deleteNameQuestion'), {name: entityLabel});
    if (confirm(message)) {
      var newTestCase = models.withoutEntity(kind, id, this.state.testCase);
      this.setState({testCase: newTestCase}, this.repair);
    }
  },
  handleDeleteIndividu: function(id) {
    var nameKey = this.props.entitiesMetadata.individus.nameKey;
    var name = this.state.testCase.individus[id][nameKey];
    var message = this.formatMessage(this.getIntlMessage('deleteNameQuestion'), {name: name});
    if (confirm(message)) {
      var newTestCase = models.withoutIndividu(id, this.props.entitiesMetadata, this.state.testCase);
      this.setState({testCase: newTestCase}, this.repair);
    }
  },
  handleDownload: function(dataKind, format) {
    function treeToArray(tree) {
      var array = [];
      var walk = variable => {
        if (variable.children) {
          variable.children.forEach(child => {
            walk(child);
          });
        }
        array.push(variable);
      };
      walk(tree);
      return array;
    }

    if (dataKind === 'simulationResult') {
      if (format === 'csv') {
        var variables = treeToArray(this.state.simulationResult);
        var data = variables.map(variable => {
          return {
            code: variable.code,
            name: variable.name,
            values: variable.values,
          };
        });
        saveAs(
          new Blob([toCsv(data)], {type: "text/csv"}),
          this.formatMessage(this.getIntlMessage('simulationResultFilename'), {extension: 'csv'})
        );
      } else if (format === 'json') {
        saveAs(
          new Blob([JSON.stringify(this.state.simulationResult, null, 2)], {type: "application/json"}),
          this.formatMessage(this.getIntlMessage('simulationResultFilename'), {extension: 'json'})
        );
      }
    } else if (dataKind === 'testCase') {
      saveAs(
        new Blob([JSON.stringify(this.state.testCase, null, 2)], {type: "application/json"}),
        this.formatMessage(this.getIntlMessage('testCaseFilename'), {extension: 'json'})
      );
    }
  },
  handleEditEntity: function(kind, id) {
    var nameKey = this.props.entitiesMetadata[kind].nameKey;
    var name = this.state.testCase[kind][id][nameKey];
    var newEditedEntity = {action: 'edit', changedValues: obj(nameKey, name), id: id, kind: kind};
    this.setState({editedEntity: newEditedEntity});
  },
  handleEditFormClose: function() {
    var {action, id, kind} = this.state.editedEntity;
    var changeset = {editedEntity: null};
    if (action === 'edit') {
      // TODO Sanitization should be done in NumberControl with valueAsNumber polyfill (?)
      var sanitizedChangedValues = Lazy(this.state.editedEntity.changedValues).map((value, columnName) => {
        var columnType = this.props.columns[columnName]['@type'];
        if (columnType === 'Integer') {
          value = parseInt(value);
          if (isNaN(value)) {
            value = null;
          }
        } else if (columnType === 'Float') {
          value = parseFloat(value);
          if (isNaN(value)) {
            value = null;
          }
        }
        return [columnName, value];
      }).toObject();
      var newEntity = Lazy(this.state.testCase[kind][id]).assign(sanitizedChangedValues).toObject();
      var newTestCase = helpers.assignIn(this.state.testCase, [kind, id], newEntity);
      changeset.testCase = newTestCase;
      var newTestCaseAdditionalData = Lazy(this.state.testCaseAdditionalData)
        .assign(this.state.editedEntity.changedAdditionalData).toObject();
      changeset.testCaseAdditionalData = newTestCaseAdditionalData;
    }
    this.setState(changeset, this.repair);
  },
  handleFieldsFormChange: function(kind, id, column, value) {
    var newValue = column.autocomplete ? value.value : value;
    var newChangedValues = Lazy(this.state.editedEntity.changedValues).assign(obj(column.name, newValue)).toObject();
    var newEditedEntity = helpers.assignIn(this.state.editedEntity, ['changedValues'], newChangedValues);
    if (column.autocomplete) {
      var newChangedAdditionalData = Lazy(this.state.editedEntity.changedAdditionalData)
        .assign(obj(column.name, value.displayedValue)).toObject();
      newEditedEntity = helpers.assignIn(newEditedEntity, ['changedAdditionalData'], newChangedAdditionalData);
    }
    var changeset = {editedEntity: newEditedEntity};
    this.setState(changeset);
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
  handleReformChange: function(value) {
    this.setState({reform: value});
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
  handleVisualizationSettingsChange: function(visualizationName, settings, simulate = false) {
    var newVisualizationsSettings = Lazy(this.state.visualizationsSettings).merge(obj(visualizationName, settings))
      .toObject();
    this.setState({visualizationsSettings: newVisualizationsSettings}, simulate ? this.simulate : null);
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
          'col-lg-3': true,
          'col-md-3': true,
          'col-sm-3': true,
          'hidden-xs': this.state.editedEntity,
        })}>
          <TestCaseToolbar
            disableSimulate={
              Boolean(this.state.editedEntity || this.state.errors || this.state.isSimulationInProgress)
            }
            entitiesMetadata={this.props.entitiesMetadata}
            errors={this.state.errors}
            getEntitiesKinds={models.getEntitiesKinds}
            onCreateEntity={this.handleCreateEntity}
            onReset={this.handleReset}
            onRepair={this.handleRepair}
            onSimulate={this.simulate}
            onYearChange={this.handleYearChange}
            testCase={this.state.testCase}
            year={this.state.year}
          />
          <hr/>
          {
            this.state.testCase && (
              <TestCase
                activeEntityId={this.state.editedEntity && this.state.editedEntity.id}
                entitiesMetadata={this.props.entitiesMetadata}
                errors={this.state.errors && this.state.errors.test_case}
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
        <div className="col-lg-9 col-md-9 col-sm-9">
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
    var categories = Lazy(this.props.columnsTree[kind].children).map(category => {
      var columns;
      if (category.children) {
        columns = Lazy(category.children).map(columnName => {
          if (columnName in this.props.columns) {
            return this.props.columns[columnName];
          } else {
            console.log(`column "${columnName}" is not in columns prop`);
          }
        }).compact().toArray();
        if ( ! columns.length) {
          columns = null;
        }
      } else {
        columns = null;
      }
      return {
        columns: columns,
        label: category.label,
      };
    }).toArray(); // jshint ignore:line
    var errors = helpers.getObjectPath(this.state.errors, 'test_case', kind, id);
    var suggestions = helpers.getObjectPath(this.state.suggestions, kind, id);
    var additionalDataValues = {};
    if (this.state.editedEntity.changedAdditionalData &&
        'depcom' in this.state.editedEntity.changedAdditionalData) {
      // First check in editedEntity
      additionalDataValues = {
        depcom: {
          displayedValue: this.state.editedEntity.changedAdditionalData.depcom,
          value: this.state.editedEntity.changedValues.depcom,
        },
      };
    } else if ('depcom' in entity) {
      additionalDataValues = {
        depcom: {
          displayedValue: this.state.testCaseAdditionalData.depcom,
          value: entity.depcom,
        },
      };
    }
    var values = Lazy(entity).assign(this.state.editedEntity.changedValues).assign(additionalDataValues).toObject();
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
    return this.state.errors ? (
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
      this.state.simulationResult && (
        this.state.simulationResult.error ? (
          <div className="alert alert-danger" role="alert">
            <h4>{this.getIntlMessage('error')}</h4>
            <p>{this.getIntlMessage('simulationErrorExplanation')}</p>
          </div>
        ) : (
          <Visualization
            columns={this.props.columns}
            defaultPropsByVisualizationSlug={this.props.defaultPropsByVisualizationSlug}
            isSimulationInProgress={this.state.isSimulationInProgress}
            onDownload={this.handleDownload}
            onReformChange={this.handleReformChange}
            onSettingsChange={this.handleVisualizationSettingsChange}
            onVisualizationChange={this.handleVisualizationChange}
            reform={this.state.reform}
            settings={this.state.visualizationsSettings}
            simulationResult={this.state.simulationResult}
            testCase={this.state.testCase}
            visualizationSlug={this.state.visualizationSlug}
          />
        )
      )
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
    if (this.props.disableSave) {
      onComplete();
    } else {
      webservices.saveCurrentTestCase(testCase, testCaseAdditionalData, data => {
        if (data && data.unauthorized) {
          // TODO i18n
          alert(this.getIntlMessage('sessionHasExpiredExplanation'));
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
          count: this.props.defaultPropsByVisualizationSlug.bareme.baremeStepsX,
          max: this.state.visualizationsSettings.bareme.xMaxValue,
          min: this.state.visualizationsSettings.bareme.xMinValue,
          name: this.state.visualizationsSettings.bareme.xAxisVariableCode,
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
