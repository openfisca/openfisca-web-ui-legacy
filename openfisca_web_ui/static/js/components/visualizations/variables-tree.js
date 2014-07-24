/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var cx = React.addons.classSet;


var VariablesTree = React.createClass({
  propTypes: {
    expandedSubtotalColor: React.PropTypes.string.isRequired,
    highlightedVariableCode: React.PropTypes.string,
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
    return (
      <div className='table-responsive'>
        <table className='table table-condensed'>
          <tbody>
            {
              this.props.variables.map(function(variable) {
                return this.renderVariable(variable);
              }.bind(this))
            }
          </tbody>
        </table>
      </div>
    );
  },
  renderVariable: function(variable) {
    var isSubtotal = variable.hasChildren && variable.depth > 0;
    var variableName = variable.name;
    if (isSubtotal) {
      variableName = (variable.collapsed ? '▶' : '▼') + ' ' + variableName;
    }
    var displayColor = ! isSubtotal || variable.collapsed;
    return (
      <tr
        className={cx({active: variable.code === this.props.highlightedVariableCode})}
        key={variable.code}
        onMouseOut={this.props.onHover.bind(null, null)}
        onMouseOver={this.props.onHover.bind(null, variable)}>
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
        <td>
          <span
            onClick={isSubtotal && this.props.onToggle.bind(null, variable)}
            style={{
              cursor: isSubtotal ? 'pointer' : 'auto',
              marginLeft: variable.depth > 0 ? (variable.depth - 1) * 20 : 0,
              fontWeight: variable.depth === 0 ? 'bold' : 'normal',
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
        <td
          className='text-right'
          style={{
            color: isSubtotal && ! variable.collapsed && this.props.expandedSubtotalColor,
            fontStyle: isSubtotal && 'italic',
            fontWeight: variable.depth === 0 ? 'bold' : 'normal',
          }}>
          {Math.round(variable.value) + ' €' /* jshint ignore:line */}
        </td>
      </tr>
    );
  },
});

module.exports = VariablesTree;
