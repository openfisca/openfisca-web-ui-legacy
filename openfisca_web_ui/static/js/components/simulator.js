/** @jsx React.DOM */
'use strict';

var invariant = require('react/lib/invariant'),
  isEqual = require('lodash.isequal'),
  Lazy = require('lazy.js'),
  React = require('react/addons'),
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
    baremeMaxValue: React.PropTypes.number.isRequired,
    baremeMinValue: React.PropTypes.number.isRequired,
    baremeVariableCode: React.PropTypes.string.isRequired,
    columns: React.PropTypes.object,
    columnsTree: React.PropTypes.object,
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
      baremeMaxValue: 40000,
      baremeMinValue: 2000,
      baremeVariableCode: 'sali',
    };
  },
  getInitialState: function() {
    return {
      calculationResult: null,
      editedEntity: null,
      errors: null,
      isCalculationInProgress: false,
      isSimulationInProgress: false,
      legislationUrl: null,
      movedIndividu: null,
      simulationResult: null,
      suggestions: null,
      testCase: null,
      visualizationSlug: 'bareme',
      waterfallExpandedVariables: {},
      year: appconfig.constants.defaultYear,
    };
  },
  handleCreateEntity: function(kind) {
    console.debug('handleCreateEntity', kind);
    var newEntity = models.TestCase.createEntity(kind, this.state.testCase);
    var newEntityId = uuid.v4();
    var newTestCase = helpers.assignObjectPath(this.state.testCase, [kind, newEntityId], newEntity);
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
    var message = 'Supprimer ' + this.state.testCase.individus[id].nom_individu + ' ?'; // jshint ignore:line
    if (confirm(message)) {
      var newTestCase = models.TestCase.withoutIndividu(id, this.state.testCase);
      this.setState({testCase: newTestCase}, function() {
        this.repair();
      });
    }
  },
  handleEditEntity: function(kind, id) {
    console.debug('handleEditEntity', kind, id);
    invariant(this.state.movedIndividu === null, 'movedIndividu exists when requesting edit entity action.');
    if (this.props.columns && this.props.columnsTree) {
      var newEditedEntity = {id: id, kind: kind};
      this.setState({editedEntity: newEditedEntity});
    } else {
      alert('Impossible de charger les champs du formulaire');
    }
  },
  handleFieldsFormCancel: function() {
    console.debug('handleFieldsFormCancel');
    this.setState({editedEntity: null});
  },
  handleFieldsFormChange: function(kind, id, columnName, value) {
    console.debug('handleFieldsFormChange', arguments);
    // Write in this.state.editedEntity.values only values that actually changed. The other stay in this.state.testCase.
    var newValues = Lazy(this.state.editedEntity.values).assign(obj(columnName, value)).toObject();
    var newEditedEntity = Lazy(this.state.editedEntity).assign({values: newValues}).toObject();
    this.setState({editedEntity: newEditedEntity});
  },
  handleFieldsFormSave: function() {
    console.debug('handleFieldsFormSave');
    var changeset = {editedEntity: null};
    var id = this.state.editedEntity.id,
      kind = this.state.editedEntity.kind,
      values = this.state.editedEntity.values;
    if (values && Object.keys(values).length) {
      var newValues = Lazy(this.state.testCase[kind][id]).merge(values).toObject();
      changeset.testCase = helpers.assignObjectPath(this.state.testCase, [kind, id], newValues);
    }
    this.setState(changeset, function() {
      this.repair();
    });
  },
  handleLegislationChange: function(legislationUrl) {
    this.setState({legislationUrl: legislationUrl}, function() {
      this.simulate();
    });
  },
  handleMoveIndividu: function(id) {
    console.debug('handleMoveIndividu', id);
    invariant(this.state.editedEntity === null, 'editedEntity exists when requesting move individu action.');
    var movedIndividu = Lazy({id: id}).merge(
      Lazy(models.kinds.map(function(kind) {
        return [
          kind,
          Lazy(models.TestCase.findEntityAndRole(id, kind, this.state.testCase)).pick(['id', 'role']).toObject(),
        ];
      }.bind(this))).toObject()
    ).toObject();
    this.setState({movedIndividu: movedIndividu});
  },
  handleMoveIndividuFormCancel: function() {
    console.debug('handleMoveIndividuFormCancel');
    this.setState({movedIndividu: null});
  },
  handleMoveIndividuFormChange: function(kind, entityId, role) {
    console.debug('handleMoveIndividuFormChange', arguments);
    var newMovedIndividu = Lazy(this.state.movedIndividu).assign(
      obj(kind, {id: entityId, role: role})
    ).toObject();
    this.setState({movedIndividu: newMovedIndividu});
  },
  handleMoveIndividuFormSave: function() {
    console.debug('handleMoveIndividuFormSave');
    var movedIndividuId = this.state.movedIndividu.id;
    var newTestCase = this.state.testCase;
    Lazy(this.state.movedIndividu).omit(['id']).each(function(entityData, kind) {
      if (entityData.id) {
        newTestCase = models.TestCase.moveIndividuInEntity(movedIndividuId, kind, entityData.id, entityData.role,
          newTestCase);
      }
    }.bind(this));
    var changeset = {movedIndividu: null, testCase: newTestCase};
    this.setState(changeset, function() {
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
  handleWaterfallVariableToggle: function(variable) {
    console.debug('handleWaterfallVariableToggle', variable);
    var status = this.state.waterfallExpandedVariables[variable.code];
    var newwaterfallExpandedVariables = Lazy(this.state.waterfallExpandedVariables)
      .assign(obj(variable.code, ! status))
      .toObject();
    this.setState({waterfallExpandedVariables: newwaterfallExpandedVariables});
  },
  handleVisualizationChange: function(slug) {
    var changeset = {visualizationSlug: slug};
    var newSimulationParams = this.simulationParams(slug),
      oldSimulationParams = this.simulationParams(this.state.visualizationSlug);
    if (isEqual(newSimulationParams, oldSimulationParams)) {
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
      rightPanel = this.renderFieldsFormPanel();
    } else if (this.state.movedIndividu) {
      var movedIndividuId = this.state.movedIndividu.id;
      var selectedByKind = Lazy(this.state.movedIndividu).omit(['id']).toObject();
      var currentEntityIdByKind = Lazy(models.kinds.map(function(kind) {
        var entityData = models.TestCase.findEntityAndRole(movedIndividuId, kind, this.state.testCase);
        if (entityData) {
          return [
            kind,
            Lazy(entityData).get('id'),
          ];
        }
      }.bind(this))).compact().toObject();
      rightPanel = (
        <EditForm
          onCancel={this.handleMoveIndividuFormCancel}
          onSave={this.handleMoveIndividuFormSave}
          title={
            'Déplacer ' + this.state.testCase.individus[movedIndividuId].nom_individu /* jshint ignore:line */
          }>
          <MoveIndividuForm
            currentEntityIdByKind={currentEntityIdByKind}
            entitiesMetadata={models.entitiesMetadata}
            getEntityLabel={models.TestCase.getEntityLabel}
            onChange={this.handleMoveIndividuFormChange}
            roleLabels={models.roleLabels}
            selectedByKind={selectedByKind}
            testCase={this.state.testCase}
          />
        </EditForm>
      );
    } else {
      rightPanel = this.renderVisualizationPanel();
    }
    return (
      <div className="row">
        <div className="col-sm-4">
          <TestCaseToolbar
            disabled={ !! this.state.editedEntity || !! this.state.movedIndividu}
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
              entitiesMetadata={models.entitiesMetadata}
              errors={this.state.errors}
              frozenEntity={this.state.editedEntity || this.state.movedIndividu}
              getEntityLabel={models.TestCase.getEntityLabel}
              onCreateEntity={this.handleCreateEntity}
              onCreateIndividuInEntity={this.handleCreateIndividuInEntity}
              onDeleteEntity={this.handleDeleteEntity}
              onDeleteIndividu={this.handleDeleteIndividu}
              onEditEntity={this.handleEditEntity}
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
    var id = this.state.editedEntity.id,
      kind = this.state.editedEntity.kind;
    var entity = this.state.testCase[kind][id];
    var title = kind === 'individus' ?
      entity.nom_individu : // jshint ignore:line
      models.TestCase.getEntityLabel(kind, entity);
    invariant('children' in this.props.columnsTree[kind], 'columnsTree.' + kind + ' has no children');
    var categories = Lazy(this.props.columnsTree[kind].children).map(function(category) {
      return {
        columns: category.children ? category.children.map(function(columnName) {
          invariant(columnName in this.props.columns, 'column "' + columnName + '" is not in columns prop');
          return this.props.columns[columnName];
        }, this) : null,
        label: category.label,
      };
    }.bind(this)).toArray();
    var errors = helpers.getObjectPath(this.state.errors, kind, id);
    var suggestions = helpers.getObjectPath(this.state.suggestions, kind, id);
    var values = this.state.testCase[kind][id];
    if (this.state.editedEntity.values) {
      values = Lazy(values).merge(this.state.editedEntity.values).toObject();
    }
    return (
      <EditForm
        onCancel={this.handleFieldsFormCancel}
        onSave={this.handleFieldsFormSave}
        title={'Éditer ' + title}>
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
    var visualizationHeight = rightPanelWidth * 0.66;
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
      } else if (Lazy(this.state.visualizationSlug).startsWith('situateur-')) {
        var value = this.state.simulationResult[0].values[0];
        var curveLabel, hintFormat, pointLabel, points;
        if (this.state.visualizationSlug === 'situateur-revdisp') {
          curveLabel = 'Revenu disponible';
          hintFormat = '{percent} % des français ont un revenu disponible inférieur à {amount} €'; // jshint ignore:line
          pointLabel = 'Votre revenu disponible';
          points = revdispDistribution;
        } else if (this.state.visualizationSlug === 'situateur-sal') {
          curveLabel = 'Salaires imposables';
          hintFormat = '{percent} % des français ont des salaires imposables inférieurs à {amount} €'; // jshint ignore:line
          pointLabel = 'Vos salaires imposables';
          points = salDistribution;
        }
        return (
          <SituateurVisualization
            curveLabel={curveLabel}
            height={visualizationHeight}
            hintFormat={hintFormat}
            pointLabel={pointLabel}
            points={points}
            value={value}
            width={rightPanelWidth}
            xSnapIntervalValue={5}
            yMaxValue={Math.max(100000, value)}
          />
        );
      } else if (this.state.visualizationSlug === 'bareme') {
        return (
          <BaremeVisualization
            expandedVariables={this.state.waterfallExpandedVariables}
            height={visualizationHeight}
            onVariableToggle={this.handleWaterfallVariableToggle}
            variablesTree={this.state.simulationResult}
            width={rightPanelWidth}
            xMaxValue={this.props.baremeMaxValue}
            xMinValue={this.props.baremeMinValue}
          />
        );
      } else if (this.state.visualizationSlug === 'cascade') {
        return (
          <WaterfallVisualization
            expandedVariables={this.state.waterfallExpandedVariables}
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
            this.state.errors && <p>Erreurs dans le formulaire</p>
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
    if ( ! this.state.isSimulationInProgress && ! this.state.errors) {
      this.setState({isSimulationInProgress: true}, function() {
        var params = this.simulationParams(this.state.visualizationSlug);
        webservices.simulate(params.axes, params.decomposition, this.state.legislationUrl, this.state.testCase,
          this.state.year, this.simulationCompleted);
      }.bind(this));
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
          max: this.props.baremeMaxValue,
          min: this.props.baremeMinValue,
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
