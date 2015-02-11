/** @jsx React.DOM */
'use strict';

var toCsv = require('to-csv'),
  invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react'),
  ReactIntlMixin = require('react-intl'),
  saveAs = require('filesaver.js'),
  shallowEqual = require('react/lib/shallowEqual'),
  uuid = require('uuid');

var BaremeVisualization = require('./visualizations/bareme-visualization'),
  EditForm = require('./edit-form'),
  FieldsForm = require('./test-case/form/fields-form'),
  helpers = require('../helpers'),
  MoveIndividuForm = require('./test-case/move-individu-form'),
  ReformSelect = require('./reform-select'),
  revdispDistribution = require('../../data/revdisp-distribution.json'),
  salDistribution = require('../../data/sal-distribution.json'),
  SendFeedbackButton = require('./send-feedback-button'),
  SituateurVisualization = require('./visualizations/situateur-visualization'),
  TestCase = require('./test-case/test-case'),
  testCases = require('../test-cases'),
  TestCaseToolbar = require('./test-case/test-case-toolbar'),
  WaterfallVisualization = require('./visualizations/waterfall-visualization'),
  YearInput = require('./test-case/year-input'),
  webservices = require('../webservices');


var appconfig = global.appconfig,
  cx = React.addons.classSet;


var Simulator = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    columns: React.PropTypes.object.isRequired,
    columnsTree: React.PropTypes.object.isRequired,
    disableSave: React.PropTypes.bool,
    entitiesMetadata: React.PropTypes.object.isRequired,
    reforms: React.PropTypes.object,
    visualizations: React.PropTypes.array,
  },
  componentWillMount() {
    webservices.fetchCurrentTestCase(data => {
      if (data && data.error) {
  //      console.error(data.error); // TODO handle error
        this.setState(Lazy(this.state).assign({testCase: null}).toObject());
      } else {
        var {testCase, testCaseAdditionalData} = data;
        if ( ! testCase) {
          testCase = testCases.getInitialTestCase(this.props.entitiesMetadata);
        }
        var newState = Lazy(this.state).assign({testCase, testCaseAdditionalData}).toObject();
        this.setState(newState, () => {
          this.repair(testCase, testCaseAdditionalData);
        });
      }
    });
  },
  getDefaultProps() {
    return {
      defaultPropsByVisualizationSlug: {
        bareme: {
          baremeStepsX: 50,
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
      downloadAttribution: '© openfisca.fr',
      visualizationsLabelsFontSize: 14,
    };
  },
  getInitialState() {
    return {
      editedEntity: null,
      errors: null,
      isSimulationInProgress: false,
      selectedReformKey: null,
      selectedReformMode: 'with',
      selectedVisualizationSlug: 'waterfall',
      simulationError: null,
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
      year: appconfig.constants.defaultYear,
    };
  },
  handleCollapsedVariablesChange(variableCode, newStatus) {
    var newVisualizationsSettings = helpers.assignIn(this.state.visualizationsSettings,
      ['shared', 'collapsedVariables', variableCode], newStatus);
    this.setState({visualizationsSettings: newVisualizationsSettings});
  },
  handleCreateEntity(kind) {
    // FIXME use withEntity
    var newEntity = testCases.createEntity(kind, this.props.entitiesMetadata, this.state.testCase);
    var newEntityId = uuid.v4();
    var newTestCase = helpers.assignIn(this.state.testCase, [kind, newEntityId], newEntity);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleCreateIndividuInEntity(kind, id, role) {
    // TODO use withIndividu
    var newIndividu = testCases.createIndividu(this.props.entitiesMetadata, this.state.testCase);
    var newIndividuId = uuid.v4();
    var newIndividus = Lazy(this.state.testCase.individus).assign({[newIndividuId]: newIndividu}).toObject();
    var newTestCase = Lazy(this.state.testCase).assign({individus: newIndividus}).toObject();
    newTestCase = testCases.withIndividuInEntity(newIndividuId, kind, id, role, this.props.entitiesMetadata,
        newTestCase);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleDeleteEntity(kind, id) {
    var entity = this.state.testCase[kind][id];
    var entityLabel = testCases.getEntityLabel(kind, entity, this.props.entitiesMetadata);
    var message = this.formatMessage(this.getIntlMessage('deleteNameQuestion'), {name: entityLabel});
    if (confirm(message)) {
      var newTestCase = testCases.withoutEntity(kind, id, this.state.testCase);
      this.setState({testCase: newTestCase}, this.repair);
    }
  },
  handleDeleteIndividu(id) {
    var nameKey = this.props.entitiesMetadata.individus.nameKey;
    var name = this.state.testCase.individus[id][nameKey];
    var message = this.formatMessage(this.getIntlMessage('deleteNameQuestion'), {name: name});
    if (confirm(message)) {
      var newTestCase = testCases.withoutIndividu(id, this.props.entitiesMetadata, this.state.testCase);
      this.setState({testCase: newTestCase}, this.repair);
    }
  },
  handleDownload(dataKind, format) {
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

    invariant(this.state.simulationResult, 'this.state.simulationResult is not defined');
    if (dataKind === 'simulationResult') {
      var variablesTree = this.state.simulationResult.value;
      if (format === 'csv') {
        var variables = treeToArray(variablesTree);
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
          new Blob([JSON.stringify(variablesTree, null, 2)], {type: "application/json"}),
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
  handleEditEntity(kind, id) {
    var nameKey = this.props.entitiesMetadata[kind].nameKey;
    var name = this.state.testCase[kind][id][nameKey];
    var newEditedEntity = {action: 'edit', changedValues: {[nameKey]: name}, id: id, kind: kind};
    this.setState({editedEntity: newEditedEntity});
  },
  handleEditFormClose() {
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
  handleFieldsFormChange(kind, id, column, value) {
    var newValue = column.autocomplete ? value.value : value;
    var newChangedValues = Lazy(this.state.editedEntity.changedValues).assign({[column.name]: newValue}).toObject();
    var newEditedEntity = helpers.assignIn(this.state.editedEntity, ['changedValues'], newChangedValues);
    if (column.autocomplete) {
      var newChangedAdditionalData = Lazy(this.state.editedEntity.changedAdditionalData)
        .assign({[column.name]: value.displayedValue}).toObject();
      newEditedEntity = helpers.assignIn(newEditedEntity, ['changedAdditionalData'], newChangedAdditionalData);
    }
    this.setState({editedEntity: newEditedEntity});
  },
  handleMoveIndividu(id) {
    var newEditedEntity = {action: 'move', id: id, kind: 'individus'};
    this.setState({
      editedEntity: this.state.editedEntity && shallowEqual(this.state.editedEntity, newEditedEntity) ?
        null : newEditedEntity,
    });
  },
  handleMoveIndividuFormChange(whatChanged, kind, value) {
    invariant(this.state.editedEntity, 'handler called without editedEntity in state.');
    var movedIndividuId = this.state.editedEntity.id;
    var oldEntityData = testCases.findEntityAndRole(movedIndividuId, kind, this.props.entitiesMetadata,
      this.state.testCase);
    var newEntityId = whatChanged === 'entity' ? value : oldEntityData.id;
    var newRole = whatChanged === 'role' ? value : oldEntityData.role;
    var newTestCase = testCases.moveIndividuInEntity(movedIndividuId, kind, newEntityId, newRole,
      this.props.entitiesMetadata, this.state.testCase);
    this.setState({testCase: newTestCase}, this.repair);
  },
  handleReformKeyChange(reformKey) {
    this.setState({selectedReformKey: reformKey}, this.simulate);
  },
  handleReformModeChange(reformMode) {
    this.setState({selectedReformMode: reformMode});
  },
  handleRepair() {
    if ( ! this.state.editedEntity) {
      this.repair();
    }
  },
  handleReset() {
    var message = this.getIntlMessage('resetSituationConfirmMessage');
    if (confirm(message)) {
      var initialTestCase = testCases.getInitialTestCase(this.props.entitiesMetadata);
      if (this.state.editedEntity) {
        this.setState({editedEntity: null});
      }
      this.repair(initialTestCase, null);
    }
  },
  handleVisualizationChange(visualizationSlug) {
    var changeset = {selectedVisualizationSlug: visualizationSlug};
    if (visualizationSlug !== this.state.selectedVisualizationSlug) {
      changeset.simulationResult = null;
    }
    if (visualizationSlug.startsWith('situateur-') && this.state.selectedReformMode === 'difference') {
      changeset.selectedReformMode = 'with';
    }
    this.setState(changeset, this.simulate);
  },
  handleVisualizationSettingsChange(visualizationName, settings, simulate) {
    var newVisualizationsSettings = Lazy(this.state.visualizationsSettings).merge({[visualizationName]: settings})
      .toObject();
    this.setState({visualizationsSettings: newVisualizationsSettings}, simulate ? this.simulate : null);
  },
  handleVisualizationStateChange(visualizationState) {
    this.setState({[this.state.selectedVisualizationSlug]: visualizationState});
  },
  handleYearChange(year) {
    this.setState({errors: null, year: year}, this.simulate);
  },
  render() {
    var rightColumnElement;
    if (this.state.editedEntity) {
      if (this.state.editedEntity.action === 'edit') {
        rightColumnElement = this.renderFieldsForm();
      } else {
        rightColumnElement = this.renderMoveIndividuForm();
      }
    } else {
      rightColumnElement = this.renderVisualization();
    }
    var disabled = Boolean(this.state.editedEntity || this.state.errors || this.state.isSimulationInProgress);
    return (
      <div className='row'>
        <div className={cx({
          'col-lg-3': true,
          'col-md-3': true,
          'col-sm-3': true,
          'hidden-xs': this.state.editedEntity,
        })}>
          <TestCaseToolbar
            disabled={disabled}
            entitiesMetadata={this.props.entitiesMetadata}
            errors={this.state.errors}
            getEntitiesKinds={testCases.getEntitiesKinds}
            isSimulationInProgress={this.state.isSimulationInProgress}
            onCreateEntity={this.handleCreateEntity}
            onReset={this.handleReset}
            onRepair={this.handleRepair}
            onSimulate={() => this.simulate(true)}
            reformKey={this.state.selectedReformKey}
            testCase={this.state.testCase}
          />
          <hr />
          {
            this.state.testCase && (
              <TestCase
                activeEntityId={this.state.editedEntity && this.state.editedEntity.id}
                disabled={disabled}
                entitiesMetadata={this.props.entitiesMetadata}
                errors={this.state.errors && this.state.errors.test_case}
                getEntitiesKinds={testCases.getEntitiesKinds}
                getEntityLabel={testCases.getEntityLabel}
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
          {rightColumnElement}
        </div>
      </div>
    );
  },
  renderMoveIndividuForm() {
    invariant(this.state.editedEntity.action === 'move', 'editedEntity.action is either "edit" or "move"');
    var currentEntityIdByKind = {},
      currentRoleByKind = {};
    var kinds = testCases.getEntitiesKinds(this.props.entitiesMetadata, {persons: false});
    kinds.forEach(kind => {
      var entityData = testCases.findEntityAndRole(this.state.editedEntity.id, kind, this.props.entitiesMetadata,
        this.state.testCase);
      if (entityData) {
        currentEntityIdByKind[kind] = entityData.id;
        currentRoleByKind[kind] = entityData.role;
      }
    });
    var nameKey = this.props.entitiesMetadata.individus.nameKey;
    var name = this.state.testCase.individus[this.state.editedEntity.id][nameKey];
    return (
      <EditForm
        onClose={this.handleEditFormClose}
        title={this.formatMessage(this.getIntlMessage('moveFormTitle'), {name: name})}
      >
        <MoveIndividuForm
          currentEntityIdByKind={currentEntityIdByKind}
          currentRoleByKind={currentRoleByKind}
          entitiesMetadata={this.props.entitiesMetadata}
          getEntitiesKinds={testCases.getEntitiesKinds}
          getEntityLabel={testCases.getEntityLabel}
          onEntityChange={(kind, value) => this.handleMoveIndividuFormChange('entity', kind, value)}
          onRoleChange={(kind, value) => this.handleMoveIndividuFormChange('role', kind, value)}
          testCase={this.state.testCase}
        />
      </EditForm>
    );
  },
  renderFieldsForm() {
    var {id, kind} = this.state.editedEntity,
      entity = this.state.testCase[kind][id];
    var entityLabel = testCases.getEntityLabel(kind, entity, this.props.entitiesMetadata);
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
        title={this.formatMessage(this.getIntlMessage('editFormTitle'), {name: entityLabel})}
      >
        <FieldsForm
          categories={categories}
          errors={errors}
          onChange={(column, value) => this.handleFieldsFormChange(kind, id, column, value)}
          suggestions={suggestions}
          values={values}
        />
      </EditForm>
    );
  },
  renderSituateurVisualization(variableName) {
    var valueKey = this.state.selectedReformKey === null || this.state.selectedReformMode === 'with' ?
      'value' : 'base_value';
    var value = this.state.simulationResult && this.state.simulationResult[valueKey] ?
      this.state.simulationResult[valueKey][0].values[0] : null;
    var curveLabel, formatHint, pointLabel, points;
    // TODO translate labels and hints.
    if (variableName === 'revdisp') {
      curveLabel = 'Revenu disponible';
      formatHint = (amount, percent) => `${percent} % des français ont un revenu disponible inférieur à ${amount} €`; // jshint ignore:line
      pointLabel = 'Votre revenu disponible';
      points = revdispDistribution;
    } else if (variableName === 'sal') {
      curveLabel = 'Salaires imposables';
      formatHint = (amount, percent) => `${percent} % des français ont des salaires imposables inférieurs à ${amount} €`; // jshint ignore:line
      pointLabel = 'Vos salaires imposables';
      points = salDistribution;
    }
    return (
      <SituateurVisualization
        curveLabel={curveLabel}
        disabled={this.state.isSimulationInProgress}
        formatHint={formatHint}
        labelsFontSize={this.props.labelsFontSize}
        onVisualizationChange={this.handleVisualizationChange}
        pointLabel={pointLabel}
        points={points}
        value={value}
        visualizationSlug={this.state.selectedVisualizationSlug}
        xFormatNumber={(value) => helpers.formatFrenchNumber(value, {fixed: 0})}
        xSnapIntervalValue={5}
        yFormatNumber={helpers.formatFrenchNumber}
        yMaxValue={Math.max(100000, value)}
      />
    );
  },
  renderVisualization() {
    var bodyElement;
    if (this.state.errors) {
      bodyElement = (
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
      );
    } else {
      if (this.state.simulationError) {
        bodyElement = (
          <div className="alert alert-danger" role="alert">
            <h4>{this.getIntlMessage('error')}</h4>
            <p>{this.getIntlMessage('simulationErrorExplanation')}</p>
          </div>
        );
      } else {
        var loadingIndicatorElement = (<p>{this.getIntlMessage('loading')}</p>);
        if (this.state.selectedVisualizationSlug === 'bareme') {
          bodyElement = (
            <BaremeVisualization
              baseVariablesTree={this.state.simulationResult && this.state.simulationResult.base_value}
              collapsedVariables={this.state.visualizationsSettings.bareme.collapsedVariables}
              columns={this.props.columns}
              defaultProps={this.props.defaultPropsByVisualizationSlug.bareme}
              disabled={this.state.isSimulationInProgress}
              displayBisectrix={this.state.visualizationsSettings.bareme.displayBisectrix}
              displaySettings={this.state.visualizationsSettings.bareme.displaySettings}
              downloadAttribution={this.props.downloadAttribution}
              formatNumber={helpers.formatFrenchNumber}
              isChartFullWidth={this.state.visualizationsSettings.bareme.isChartFullWidth}
              isSimulationInProgress={this.state.isSimulationInProgress}
              labelsFontSize={this.props.visualizationsLabelsFontSize}
              loadingIndicatorElement={loadingIndicatorElement}
              onDownload={this.handleDownload}
              onSettingsChange={
                (settings, simulate) => this.handleVisualizationSettingsChange('bareme', settings, simulate)
              }
              onVisualizationChange={this.handleVisualizationChange}
              reformKey={this.state.selectedReformKey}
              reformMode={this.state.selectedReformMode}
              variablesTree={this.state.simulationResult && this.state.simulationResult.value}
              visualizationSlug={this.state.selectedVisualizationSlug}
              xAxisVariableCode={this.state.visualizationsSettings.bareme.xAxisVariableCode}
              xMaxValue={this.state.visualizationsSettings.bareme.xMaxValue}
              xMinValue={this.state.visualizationsSettings.bareme.xMinValue}
            />
          );
        } else if (this.state.selectedVisualizationSlug === 'situateur-revdisp') {
          bodyElement = this.renderSituateurVisualization('revdisp');
        } else if (this.state.selectedVisualizationSlug === 'situateur-sal') {
          bodyElement = this.renderSituateurVisualization('sal');
        } else if (this.state.selectedVisualizationSlug === 'waterfall') {
          bodyElement = (
            <WaterfallVisualization
              baseVariablesTree={this.state.simulationResult && this.state.simulationResult.base_value}
              collapsedVariables={this.state.visualizationsSettings.waterfall.collapsedVariables}
              defaultProps={this.props.defaultPropsByVisualizationSlug.waterfall}
              disabled={this.state.isSimulationInProgress}
              displaySettings={this.state.visualizationsSettings.waterfall.displaySettings}
              displaySubtotals={this.state.visualizationsSettings.waterfall.displaySubtotals}
              displayVariablesColors={this.state.visualizationsSettings.waterfall.displayVariablesColors}
              downloadAttribution={this.props.downloadAttribution}
              formatNumber={helpers.formatFrenchNumber}
              isChartFullWidth={this.state.visualizationsSettings.waterfall.isChartFullWidth}
              isSimulationInProgress={this.state.isSimulationInProgress}
              labelsFontSize={this.props.visualizationsLabelsFontSize}
              loadingIndicatorElement={loadingIndicatorElement}
              onDownload={this.handleDownload}
              onSettingsChange={
                (settings, simulate) => this.handleVisualizationSettingsChange('waterfall', settings, simulate)
              }
              onVisualizationChange={this.handleVisualizationChange}
              reformKey={this.state.selectedReformKey}
              reformMode={this.state.selectedReformMode}
              variablesTree={this.state.simulationResult && this.state.simulationResult.value}
              visualizationSlug={this.state.selectedVisualizationSlug}
            />
          );
        }
      }
    }
    var disabled = Boolean(this.state.editedEntity || this.state.errors || this.state.isSimulationInProgress);
    return (
      <div>
        <div className='clearfix form-inline'>
          <YearInput
            className='form-group'
            disabled={disabled}
            error={this.state.errors && this.state.errors.period && this.state.errors.period['1']}
            onChange={this.handleYearChange}
            value={this.state.year}
          />
          {
            this.props.reforms && (
              <ReformSelect
                className='form-group'
                disabled={disabled}
                disableDifference={this.state.selectedVisualizationSlug.startsWith('situateur-')}
                onKeyChange={this.handleReformKeyChange}
                onModeChange={this.handleReformModeChange}
                reforms={this.props.reforms}
                selectedKey={this.state.selectedReformKey}
                selectedMode={this.state.selectedReformMode}
                style={{marginLeft: 10}}
              />
            )
          }
          {
            this.state.testCase && (
              <SendFeedbackButton
                className='btn btn-link pull-right'
                testCase={this.state.testCase}
              />
            )
          }
        </div>
        <hr />
        {bodyElement}
      </div>
    );
  },
  repair(testCase, testCaseAdditionalData) {
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
        var newTestCase = testCases.withEntitiesNamesFilled(this.props.entitiesMetadata, repairedTestCase);
        changeset.testCase = newTestCase;
        this.save(newTestCase, testCaseAdditionalData, saveComplete);
      }
    });
  },
  save(testCase, testCaseAdditionalData, onComplete) {
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
  simulate(force) {
    // force parameter bypasses the cache.
    if ( ! this.state.isSimulationInProgress && ! this.state.errors && ! this.state.editedEntity) {
      this.setState({isSimulationInProgress: true}, () => {
        var params = this.simulationParams(this.state.selectedVisualizationSlug);
        webservices.simulate(params.axes, params.decomposition, this.state.selectedReformKey, this.state.testCase,
          this.state.year, force, (result) => {
            var changeset = {isSimulationInProgress: false};
            if (result.error) {
              changeset.errors = null;
              changeset.simulationError = result.error;
              changeset.simulationResult = null;
            } else {
              if (result.errors) {
                changeset.errors = result.errors;
                changeset.simulationError = null;
                changeset.simulationResult = null;
              } else {
                changeset.errors = null;
                changeset.simulationError = null;
                changeset.simulationResult = result;
              }
            }
            this.setState(changeset);
          });
      });
    }
  },
  simulationParams(visualizationSlug) {
    var params = {};
    if (visualizationSlug === 'bareme') {
      params.axes = [
        {
          count: this.props.defaultPropsByVisualizationSlug.bareme.baremeStepsX,
          max: this.state.visualizationsSettings.bareme.xMaxValue,
          min: this.state.visualizationsSettings.bareme.xMinValue,
          name: this.state.visualizationsSettings.bareme.xAxisVariableCode,
        },
      ];
    }
    if (visualizationSlug === 'situateur-revdisp') {
      params.decomposition = ['revdisp'];
    } else if (visualizationSlug === 'situateur-sal') {
      params.decomposition = ['sal'];
    }
    return params;
  },
});


module.exports = Simulator;
