/** @jsx React.DOM */
'use strict';

var Lazy = require('lazy.js'),
  React = require('react/addons');

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
  getDefaultProps: function() {
    return {
      expandedSubtotalColor: 'lightGray',
      noColorFill: 'gray',
    };
  },
  render: function() {
    var variablesSequence = Lazy(this.props.variables);
    var variables = variablesSequence.initial().reverse().concat(variablesSequence.last()).toArray();
    return (
      <div className='table-responsive'>
        <table className='table table-condensed'>
          <tbody>
            {
              variables.map(variable => this.renderVariable(variable))
            }
          </tbody>
        </table>
      </div>
    );
  },
  renderVariable: function(variable) {
    var variableName = variable.name;
    if (variable.isSubtotal) {
      variableName = (variable.isCollapsed ? '▶' : '▼') + ' ' + variableName;
    }
    var displayColor = ! variable.isSubtotal || variable.isCollapsed;
    return (
      <tr
        className={cx({active: variable.code === this.props.activeVariableCode})}
        key={variable.code}
        onMouseOut={this.props.onHover.bind(null, null)}
        onMouseOver={this.props.onHover.bind(null, variable)}>
        <td>
          <span
            onClick={variable.isSubtotal && this.props.onToggle.bind(null, variable)}
            style={{
              cursor: variable.isSubtotal ? 'pointer' : 'auto',
              fontWeight: variable.depth === 0 ? 'bold' : 'normal',
              marginLeft: variable.depth > 0 ? (variable.depth - 1) * 20 : 0,
            }}>
            {variableName}
          </span>
          {
            variable.url && (
              <a
                className='btn btn-default btn-xs'
                href={variable.url}
                style={{marginLeft: '1em'}}
                target='_blank'
                title={'Explication sur ' + variable.name}>
                ?
              </a>
            )
          }
        </td>
        {
          variable.value && (
            <td
              className='text-right'
              style={{
                color: variable.isSubtotal && ! variable.isCollapsed && this.props.expandedSubtotalColor,
                fontStyle: variable.isSubtotal && 'italic',
                fontWeight: variable.depth === 0 ? 'bold' : 'normal',
              }}>
              {this.props.formatNumber(variable.value) + ' €' /* jshint ignore:line */}
            </td>
          )
        }
        <td style={{width: 20}}>
          {
            displayColor && (
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
      </tr>
    );
  },
});

module.exports = VariablesTree;
