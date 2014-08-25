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
            {variables.map(variable => this.renderVariable(variable))}
          </tbody>
        </table>
      </div>
    );
  },
  renderVariable: function(variable) {
    return (
      <tr
        className={cx({active: variable.code === this.props.activeVariableCode})}
        key={variable.code}
        onClick={variable.isSubtotal && this.props.onToggle.bind(null, variable)}
        onMouseOut={this.props.onHover.bind(null, null)}
        onMouseOver={this.props.onHover.bind(null, variable)}
        style={{cursor: variable.isSubtotal ? 'pointer' : null}}>
        <td
          style={{
            fontWeight: variable.depth === 0 ? 'bold' : null,
            paddingLeft: variable.depth > 1 ? (variable.depth - 1) * 20 : null,
          }}>
          {variable.isSubtotal ? `${variable.isCollapsed ? '▶' : '▼'} ${variable.name}` : variable.name}
        </td>
        {
          variable.value && (
            <td
              className='text-right'
              style={{
                color: variable.isSubtotal && ! variable.isCollapsed && this.props.expandedSubtotalColor,
                fontStyle: variable.isSubtotal && 'italic',
                fontWeight: variable.depth === 0 ? 'bold' : null,
              }}>
              {this.props.formatNumber(variable.value) + ' €' /* jshint ignore:line */}
            </td>
          )
        }
        <td style={{width: 20}}>
          {
            ! variable.isSubtotal || variable.isCollapsed && (
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
        <td style={{width: 20}}>
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
      </tr>
    );
  },
});

module.exports = VariablesTree;
