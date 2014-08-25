/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons');

var Tooltip = require('../tooltip');

var cx = React.addons.classSet;


var VariablesTree = React.createClass({
  propTypes: {
    activeVariableCode: React.PropTypes.string,
    expandedSubtotalColor: React.PropTypes.string.isRequired,
    formatNumber: React.PropTypes.func.isRequired,
    noColorFill: React.PropTypes.string.isRequired,
    onHover: React.PropTypes.func.isRequired,
    onToggle: React.PropTypes.func,
    variables: React.PropTypes.array.isRequired,
  },
  componentDidMount: function() {
    $(this.refs.externalLink.getDOMNode()).tooltip();
  },
  componentDidUpdate: function() {
    $(this.refs.externalLink.getDOMNode()).tooltip('fixTitle');
  },
  getDefaultProps: function() {
    return {
      expandedSubtotalColor: 'lightGray',
      noColorFill: 'gray',
    };
  },
  getInitialState: function() {
    return {hoveredVariableCode: null};
  },
  handleHover: function(variable) {
    this.setState({hoveredVariableCode: variable ? variable.code : null});
    this.props.onHover(variable);
  },
  render: function() {
    var variablesSequence = Lazy(this.props.variables);
    var variables = variablesSequence.initial().reverse().concat(variablesSequence.last()).toArray();
    return (
      <div className='table-responsive'>
        <table className='table table-condensed'>
          <tbody>
            {variables.map(variable => this.renderVariable(variable))}
          </tbody>
        </table>
      </div>
    );
  },
  renderVariable: function(variable) {
    var onVariableClick = variable.isSubtotal && this.props.onToggle.bind(null, variable);
    return (
      <tr
        className={cx({active: variable.code === this.props.activeVariableCode})}
        key={variable.code}
        onMouseOut={this.handleHover.bind(null, null)}
        onMouseOver={this.handleHover.bind(null, variable)}
        style={{cursor: variable.isSubtotal ? 'pointer' : null}}>
        <td
          onClick={onVariableClick}
          style={{
            fontWeight: variable.depth === 0 ? 'bold' : null,
            paddingLeft: variable.depth > 1 ? (variable.depth - 1) * 20 : null,
            textDecoration: variable.code === this.state.hoveredVariableCode &&
              variable.isSubtotal ? 'underline' : null,
          }}>
          {variable.isSubtotal ? `${variable.isCollapsed ? '▶' : '▼'} ${variable.name}` : variable.name}
        </td>
        {
          variable.value && (
            <td
              className='text-right'
              onClick={onVariableClick}
              style={{
                color: variable.isSubtotal && ! variable.isCollapsed && this.props.expandedSubtotalColor,
                fontStyle: variable.isSubtotal && 'italic',
                fontWeight: variable.depth === 0 ? 'bold' : null,
              }}>
              {this.props.formatNumber(variable.value) + ' €' /* jshint ignore:line */}
            </td>
          )
        }
        <td onClick={onVariableClick}>
          {
            (! variable.isSubtotal || variable.isCollapsed) && (
              <div style={{
                backgroundColor: variable.color ? 'rgb(' + variable.color.join(',') + ')' : this.props.noColorFill,
                border: '1px solid gray',
                width: 20,
              }}>
                { /* jshint ignore:line */}
              </div>
            )
          }
        </td>
        <td>
          {
            variable.url && (
              <Tooltip placement='left'>
                <a
                  href={variable.url}
                  ref='externalLink'
                  target='_blank'
                  title={`Explication sur ${variable.name}`}>
                  <span className='glyphicon glyphicon-question-sign'></span>
                </a>
              </Tooltip>
            )
          }
        </td>
      </tr>
    );
  },
});

module.exports = VariablesTree;
