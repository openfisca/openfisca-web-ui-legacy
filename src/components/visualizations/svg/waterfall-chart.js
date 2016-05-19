import {Component} from 'react'

var axes = require('../../../axes'),
  HGrid = require('./h-grid'),
  WaterfallBars = require('./waterfall-bars'),
  WaterfallBarHover = require('./waterfall-bar-hover'),
  XAxisLabelled = require('./x-axis-labelled'),
  YAxis = require('./y-axis');


export default class WaterfallChart extends Component {
  propTypes: {
    activeVariablesCodes: React.PropTypes.arrayOf(React.PropTypes.string),
    aspectRatio: React.PropTypes.number.isRequired,
    attribution: React.PropTypes.string,
    displayVariablesColors: React.PropTypes.bool,
    formatNumber: React.PropTypes.func.isRequired,
    height: React.PropTypes.number,
    labelsFontSize: React.PropTypes.number.isRequired,
    marginRight: React.PropTypes.number.isRequired,
    marginTop: React.PropTypes.number.isRequired,
    negativeColor: React.PropTypes.string.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onVariableHover: React.PropTypes.func,
    onVariableToggle: React.PropTypes.func,
    positiveColor: React.PropTypes.string.isRequired,
    variables: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
    xAxisHeight: React.PropTypes.number.isRequired,
    yNbSteps: React.PropTypes.number.isRequired,
  }
  componentDidMount() {
    var yAxisDOMNode = this.refs.yAxis.getDOMNode();
    var newYAxisWidth = Math.ceil(yAxisDOMNode.getBoundingClientRect().width);
    this.setState({yAxisWidth: newYAxisWidth});
  }
  componentDidUpdate() {
    var yAxisDOMNode = this.refs.yAxis.getDOMNode();
    var newYAxisWidth = Math.ceil(yAxisDOMNode.getBoundingClientRect().width);
    if (newYAxisWidth !== this.state.yAxisWidth) {
      this.setState({yAxisWidth: newYAxisWidth});
    }
  }
  determineYAxisRange(variables) {
    var maxValue = 0;
    var minValue = 0;
    variables.forEach(function(variable) {
      var value = variable.baseValue + variable.value;
      if (value > maxValue) {
        maxValue = value;
      } else if (value < minValue) {
        minValue = value;
      }
    });
    return [minValue, maxValue];
  }
  getDefaultProps() {
    return {
      aspectRatio: 4/3,
      defaultYAxisWidth: 200,
      marginRight: 10,
      marginTop: 10,
      negativeColor: 'red',
      noColorFill: 'gray',
      positiveColor: 'green',
      xAxisHeight: 100,
      yNbSteps: 8,
    };
  }
  getInitialState() {
    return {
      hoveredVariableCode: null,
      xAxisHoveredVariableCode: null,
      yAxisWidth: null,
    };
  }
  handleVariableHover(variable) {
    this.setState({hoveredVariableCode: variable ? variable.code : null});
    if (this.props.onVariableHover) {
      this.props.onVariableHover(variable);
    }
  }
  handleXAxisVariableHover(variable) {
    this.setState({xAxisHoveredVariableCode: variable ? variable.code : null});
    this.handleVariableHover(variable);
  }
  render() {
    var [yAxisMinValue, yAxisMaxValue] = this.determineYAxisRange(this.props.variables);
    if (yAxisMaxValue === yAxisMinValue) {
      yAxisMaxValue = yAxisMinValue + 1;
    }
    var ySmartValues = axes.smartValues(yAxisMinValue, yAxisMaxValue, this.props.yNbSteps);
    var xLabels = this.props.variables.map(variable => {
      var style = {};
      var name = variable.shortName;
      if (variable.isSubtotal) {
        name = (variable.isCollapsed ? '▶' : '▼') + ' ' + name;
        if (variable.code === this.state.xAxisHoveredVariableCode) {
          style.textDecoration = 'underline';
        }
      }
      var props = {
        onMouseOut: this.handleXAxisVariableHover.bind(null, null),
        onMouseOver: this.handleXAxisVariableHover.bind(null, variable),
      };
      if (this.props.onVariableToggle && variable.isSubtotal) {
        style.cursor = 'pointer';
        props.onClick = this.props.onVariableToggle.bind(null, variable);
      }
      return {name, props, style};
    });
    var height = this.props.height || this.props.width / this.props.aspectRatio;
    var yAxisWidth = this.state.yAxisWidth === null ? this.props.defaultYAxisWidth : this.state.yAxisWidth;
    var gridHeight = height - this.props.xAxisHeight - this.props.marginTop,
      gridWidth = this.props.width - yAxisWidth - this.props.marginRight;
    var stepWidth = gridWidth / xLabels.length;
    var xAxisTransform = `translate(${yAxisWidth}, ${height - this.props.xAxisHeight})`;
    return (
      <svg height={height} width={this.props.width}>
        <g transform={xAxisTransform}>
          <HGrid
            height={gridHeight}
            nbSteps={this.props.yNbSteps}
            startStep={1}
            width={gridWidth}
          />
        </g>
        <g transform={`translate(${yAxisWidth}, ${this.props.marginTop})`}>
          <YAxis
            formatNumber={this.props.formatNumber}
            height={gridHeight}
            maxValue={ySmartValues.maxValue}
            minValue={ySmartValues.minValue}
            nbSteps={this.props.yNbSteps}
            ref='yAxis'
            unit='€'
          />
          <WaterfallBars
            activeVariablesCodes={this.props.activeVariablesCodes}
            displayVariablesColors={this.props.displayVariablesColors}
            height={gridHeight}
            maxValue={ySmartValues.maxValue}
            minValue={ySmartValues.minValue}
            negativeColor={this.props.negativeColor}
            noColorFill={this.props.noColorFill}
            positiveColor={this.props.positiveColor}
            variables={this.props.variables}
            width={gridWidth}
          />
          {
            this.props.variables.map((variable, idx) =>
              <g key={variable.code} transform={`translate(${stepWidth * idx}, 0)`}>
                <WaterfallBarHover
                  barHeight={gridHeight}
                  barWidth={stepWidth}
                  labelHeight={this.props.labelsFontSize * 1.5}
                  labelWidth={this.props.xAxisHeight}
                  onHover={this.handleVariableHover}
                  variable={variable}
                />
              </g>
            )
          }
        </g>
        <g transform={xAxisTransform}>
          <XAxisLabelled
            height={this.props.xAxisHeight}
            labels={xLabels}
            labelsFontSize={this.props.labelsFontSize}
            nbSteps={xLabels.length}
            width={gridWidth}
          />
        </g>
        <g className='attribution' transform={`translate(${yAxisWidth}, ${height - 10})`}>
          <text>{this.props.attribution}</text>
        </g>
      </svg>
    );
  }
}
