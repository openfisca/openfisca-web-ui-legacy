/** @jsx React.DOM */
'use strict';

var deepEqual = require('deep-equal'),
  invariant = require('react/lib/invariant'),
  Lazy = require('lazy.js'),
  React = require('react'),
  shallowEqual = require('react/lib/shallowEqual'),
  uuid = require('uuid');

var BaremeVisualization = require('./visualizations/bareme-visualization'),
  EditForm = require('./edit-form'),
  FieldsForm = require('./test-case/form/fields-form'),
  helpers = require('../helpers'),
  JsonVisualization = require('./visualizations/json-visualization'),
  models = require('../models'),
  MoveIndividuForm = require('./test-case/move-individu-form'),
  RattachementEnfantVisualization = require('./visualizations/rattachement-enfant-visualization'),
  revdispDistribution = require('../../data/revdisp-distribution.json'),
  salDistribution = require('../../data/sal-distribution.json'),
  SituateurVisualization = require('./visualizations/situateur-visualization'),
  TestCase = require('./test-case/test-case'),
  TestCaseToolbar = require('./test-case/test-case-toolbar'),
  VisualizationToolbar = require('./visualizations/visualization-toolbar'),
  WaterfallVisualization = require('./visualizations/waterfall-visualization'),
  webservices = require('../webservices');

var appconfig = global.appconfig,
  obj = helpers.obj;


var Simulator = React.createClass({
  propTypes: {
    baremeStepsX: React.PropTypes.number.isRequired,
    baremeVariableCode: React.PropTypes.string.isRequired,
    columns: React.PropTypes.object,
    columnsTree: React.PropTypes.object,
    defaultBaremeMaxValue: React.PropTypes.number.isRequired,
    defaultBaremeMinValue: React.PropTypes.number.isRequired,
    defaultVisualizationSlug: React.PropTypes.string.isRequired,
    legislations: React.PropTypes.array,
    visualizations: React.PropTypes.array,
  },
  componentDidMount: function() {
    window.onresize = this.handleResize;
  },
  componentWillMount: function() {
    webservices.fetchCurrentTestCase(this.currentTestCaseFetched);
    webservices.fetchFields(this.fieldsFetched);
    webservices.fetchLegislations(this.legislationsFetched);
  },
  componentWillUnmount: function() {
    window.onresize = null;
  },
  currentTestCaseFetched: function(data) {
    console.debug('currentTestCaseFetched', data);
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
  currentTestCaseSaved: function(data) {
    console.debug('currentTestCaseSaved', data);
  },
  fieldsFetched: function(data) {
    console.debug('fieldsFetched', data);
    if (data) {
      if (data.error) {
        console.error(data.error);
      } else {
        this.setProps({
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
      defaultBaremeMaxValue: 20000,
      defaultBaremeMinValue: 0,
      defaultVisualizationSlug: 'bareme',
    };
  },
  getInitialState: function() {
    return {
      baremeMaxValue: this.props.defaultBaremeMaxValue,
      baremeMinValue: this.props.defaultBaremeMinValue,
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
      waterfallExpandedVariables: {},
      year: appconfig.constants.defaultYear,
    };
  },
  handleBaremeXValuesChange: function(minValue, maxValue) {
    this.setState({
      baremeMaxValue: maxValue,
      baremeMinValue: minValue,
    }, function() {
      this.simulate();
    });
  },
  handleCreateEntity: function(kind) {
    console.debug('handleCreateEntity', kind);
    var newEntity = models.TestCase.createEntity(kind, this.state.testCase);
    var newEntityId = uuid.v4();
    var newTestCase = helpers.assignIn(this.state.testCase, [kind, newEntityId], newEntity);
    this.setState({testCase: newTestCase}, function() {
      this.repair();
    });
  },
  handleCreateIndividuInEntity: function(kind, id, role) {
    console.debug('handleCreateIndividuInEntity', arguments);
    var newIndividu = models.TestCase.createIndividu(this.state.testCase);
    var newIndividuId = uuid.v4();
    var newIndividus = Lazy(this.state.testCase.individus).assign(obj(newIndividuId, newIndividu)).toObject();
    var newTestCase = Lazy(this.state.testCase).assign({individus: newIndividus}).toObject();
    newTestCase = models.TestCase.withIndividuInEntity(newIndividuId, kind, id, role, newTestCase);
    this.setState({testCase: newTestCase}, function() {
      this.repair();
    });
  },
  handleDeleteEntity: function(kind, id) {
    console.debug('handleDeleteEntity', arguments);
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
    console.debug('handleDeleteIndividu', id);
    var message = `Supprimer ${this.state.testCase.individus[id].nom_individu} ?`; // jshint ignore:line
    if (confirm(message)) {
      var newTestCase = models.TestCase.withoutIndividu(id, this.state.testCase);
      this.setState({testCase: newTestCase}, function() {
        this.repair();
      });
    }
  },
  handleEditEntity: function(kind, id) {
    console.debug('handleEditEntity', kind, id);
    if (this.props.columns && this.props.columnsTree) {
      var newEditedEntity = {action: 'edit', id: id, kind: kind};
      var nameKey = models.getNameKey(kind);
      newEditedEntity[nameKey] = this.state.testCase[kind][id][nameKey];
      this.setState({editedEntity: newEditedEntity});
    } else {
      alert('Impossible de charger les champs du formulaire');
    }
  },
  handleEditFormClose: function() {
    console.debug('handleEditFormClose');
    var {id, kind} = this.state.editedEntity;
    var nameKey = models.getNameKey(kind);
    var newTestCase = helpers.assignIn(this.state.testCase, [kind, id, nameKey], this.state.editedEntity[nameKey]);
    var changeset = {
      editedEntity: null,
      testCase: newTestCase,
    };
    this.setState(changeset, function() {
      this.simulate();
    });
  },
  handleFieldsFormChange: function(kind, id, columnName, value) {
    console.debug('handleFieldsFormChange', arguments);
    var nameKey = models.getNameKey(kind);
    if (columnName === nameKey) {
      var newEditedEntity = Lazy(this.state.editedEntity).assign(obj(columnName, value)).toObject();
      this.setState({editedEntity: newEditedEntity});
    } else {
      var newValues = Lazy(this.state.testCase[kind][id]).assign(obj(columnName, value)).toObject();
      var newTestCase = helpers.assignIn(this.state.testCase, [kind, id], newValues);
      this.setState({testCase: newTestCase}, function() {
        this.repair();
      });
    }
  },
  handleLegislationChange: function(legislationUrl) {
    this.setState({legislationUrl: legislationUrl}, function() {
      this.simulate();
    });
  },
  handleMoveIndividu: function(id) {
    console.debug('handleMoveIndividu', id);
    var newEditedEntity = {action: 'move', id: id, kind: 'individus'};
    this.setState({
      editedEntity: this.state.editedEntity && shallowEqual(this.state.editedEntity, newEditedEntity) ?
        null : newEditedEntity,
    });
  },
  handleMoveIndividuFormChange: function(whatChanged, kind, value) {
    console.debug('handleMoveIndividuFormChange', arguments);
    invariant(this.state.editedEntity, 'handler called without editedEntity in state.');
    var movedIndividuId = this.state.editedEntity.id;
    var oldEntityData = models.TestCase.findEntityAndRole(movedIndividuId, kind, this.state.testCase);
    var newEntityId = whatChanged === 'entity' ? value : oldEntityData.id;
    var newRole = whatChanged === 'role' ? value : oldEntityData.role;
    var newTestCase = models.TestCase.moveIndividuInEntity(movedIndividuId, kind, newEntityId, newRole,
      this.state.testCase);
    this.setState({testCase: newTestCase}, function() {
      this.repair();
    });
  },
  handleReset: function() {
    console.debug('handleReset');
    if (confirm('Réinitialiser la situation ?')) { // jshint ignore:line
      var initialTestCase = models.TestCase.getInitialTestCase();
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
    console.debug('handleVisualizationStateChange', visualizationState);
    this.setState(obj(this.state.visualizationSlug, visualizationState));
  },
  handleWaterfallVariableToggle: function(variable) {
    console.debug('handleWaterfallVariableToggle', variable);
    var status = this.state.waterfallExpandedVariables[variable.code];
    var newWaterfallExpandedVariables = Lazy(this.state.waterfallExpandedVariables)
      .assign(obj(variable.code, ! status))
      .toObject();
    this.setState({waterfallExpandedVariables: newWaterfallExpandedVariables});
  },
  handleYearChange: function(year) {
    console.debug('handleYearChange', year);
    this.setState({year: year}, function() {
      this.simulate();
    });
  },
  legislationsFetched: function(data) {
    console.debug('legislationsFetched', data);
    if (data) {
      if (data.error) {
        console.error(data.error);
      } else if (data.length) {
        this.setProps({legislations: data});
        this.setState({legislationSlug: data[0].slug});
      }
    }
  },
  render: function() {
    var rightPanel;
    if (this.state.editedEntity) {
      if (this.state.editedEntity.action === 'edit') {
        rightPanel = this.renderFieldsFormPanel();
      } else {
        invariant(this.state.editedEntity.action === 'move', 'editedEntity.action is either "edit" or "move"');
        var currentEntityIdByKind = Lazy(models.kinds.map(kind => {
          var entityData = models.TestCase.findEntityAndRole(this.state.editedEntity.id, kind, this.state.testCase);
          if (entityData) {
            return [kind, Lazy(entityData).get('id')];
          }
        })).compact().toObject();
        rightPanel = (
          <EditForm
            onClose={this.handleEditFormClose}
            title={
              'Déplacer ' + this.state.testCase.individus[this.state.editedEntity.id].nom_individu /* jshint ignore:line */
            }>
            <MoveIndividuForm
              currentEntityIdByKind={currentEntityIdByKind}
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
            disabled={Boolean(this.state.editedEntity)}
            hasErrors={ !! this.state.errors}
            isSimulationInProgress={this.state.isSimulationInProgress}
            onCreateEntity={this.handleCreateEntity}
            onReset={this.handleReset}
            onRepair={this.repair.bind(null, null)}
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
              onCreateEntity={this.handleCreateEntity}
              onCreateIndividuInEntity={this.handleCreateIndividuInEntity}
              onDeleteEntity={this.handleDeleteEntity}
              onDeleteIndividu={this.handleDeleteIndividu}
              onEditEntity={this.state.editedEntity === null ? this.handleEditEntity : this.handleEditFormClose}
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
    invariant('children' in this.props.columnsTree[kind], 'columnsTree.' + kind + ' has no children');
    var categories = Lazy(this.props.columnsTree[kind].children).map(category => ({
      columns: category.children ? category.children.map(columnName => {
        invariant(columnName in this.props.columns, 'column "' + columnName + '" is not in columns prop');
        return this.props.columns[columnName];
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
  renderVisualization: function() {
    invariant(this.state.simulationResult, 'this.state.simulationResult is empty');
    var rightPanelNode = this.refs.rightPanel.getDOMNode();
    var rightPanelWidth = rightPanelNode.clientWidth;
    var visualizationHeight = rightPanelWidth * 0.8;
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
      } else if (this.state.visualizationSlug === 'rattachement-enfant') {
        return (
          <RattachementEnfantVisualization
            legislationUrl={this.state.legislationUrl}
            localState={this.state[this.state.visualizationSlug]}
            onChange={this.handleVisualizationStateChange}
            testCase={this.state.testCase}
            year={this.state.year}
          />
        );
      } else if (this.state.visualizationSlug.startsWith('situateur-')) {
        var value = this.state.simulationResult[0].values[0];
        var curveLabel, formatHint, pointLabel, points;
        if (this.state.visualizationSlug === 'situateur-revdisp') {
          curveLabel = 'Revenu disponible';
          formatHint = ({amount, percent}) => `${percent} % des français ont un revenu disponible inférieur à ${amount} €`; // jshint ignore:line
          pointLabel = 'Votre revenu disponible';
          points = revdispDistribution;
        } else if (this.state.visualizationSlug === 'situateur-sal') {
          curveLabel = 'Salaires imposables';
          formatHint = ({amount, percent}) => `${percent} % des français ont des salaires imposables inférieurs à ${amount} €`; // jshint ignore:line
          pointLabel = 'Vos salaires imposables';
          points = salDistribution;
        }
        return (
          <SituateurVisualization
            curveLabel={curveLabel}
            formatHint={formatHint}
            height={visualizationHeight}
            pointLabel={pointLabel}
            points={points}
            value={value}
            width={rightPanelWidth}
            xFormatNumber={value => helpers.formatFrenchNumber(value, {fixed: 0})}
            xSnapIntervalValue={5}
            yFormatNumber={helpers.formatFrenchNumber}
            yMaxValue={Math.max(100000, value)}
          />
        );
      } else if (this.state.visualizationSlug === 'bareme') {
        return (
          <BaremeVisualization
            expandedVariables={this.state.waterfallExpandedVariables}
            formatNumber={helpers.formatFrenchNumber}
            height={visualizationHeight}
            onXValuesChange={this.handleBaremeXValuesChange}
            onVariableToggle={this.handleWaterfallVariableToggle}
            variablesTree={this.state.simulationResult}
            width={rightPanelWidth}
            xLabel="Revenus d'activité imposables"
            xMaxValue={this.state.baremeMaxValue}
            xMinValue={this.state.baremeMinValue}
          />
        );
      } else if (this.state.visualizationSlug === 'cascade') {
        return (
          <WaterfallVisualization
            expandedVariables={this.state.waterfallExpandedVariables}
            formatNumber={helpers.formatFrenchNumber}
            height={visualizationHeight}
            onVariableToggle={this.handleWaterfallVariableToggle}
            variablesTree={this.state.simulationResult}
            width={rightPanelWidth}
          />
        );
      } else if ( ! this.props.visualizations) {
        return <p className="text-danger">Aucune visualisation disponible.</p>;
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
            this.state.errors && (
              <p>Les entités comportent des erreurs. Veuillez les corriger.</p>
            )
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
    var changeset = {
      errors: errors,
      suggestions: suggestions,
    };
    if (errors) {
      changeset.simulationResult = null;
      if (originalTestCase) {
        webservices.saveCurrentTestCase(originalTestCase, this.currentTestCaseSaved);
      }
    } else if (testCase) {
      var newTestCase = models.TestCase.withEntitiesNamesFilled(testCase);
      changeset.testCase = newTestCase;
      webservices.saveCurrentTestCase(newTestCase, this.currentTestCaseSaved);
    }
    this.setState(changeset, function() {
      if ( ! this.state.errors) {
        this.simulate();
      }
    });
  },
  simulate: function() {
    console.debug('simulate');
    if ( ! this.state.isSimulationInProgress && ! this.state.errors && ! this.state.editedEntity) {
      this.setState({isSimulationInProgress: true}, () => {
        var params = this.simulationParams(this.state.visualizationSlug);
        webservices.simulate(params.axes, params.decomposition, this.state.legislationUrl, this.state.testCase,
          this.state.year, this.simulationCompleted);
      });
    }
  },
  simulationCompleted: function(data) {
    console.debug('simulationCompleted', data);
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
          max: this.state.baremeMaxValue,
          min: this.state.baremeMinValue,
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
