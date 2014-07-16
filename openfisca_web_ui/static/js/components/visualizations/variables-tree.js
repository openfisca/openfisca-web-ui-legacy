/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var cx = React.addons.classSet;


var VariablesTree = React.createClass({
  propTypes: {
    activeVariableCode: React.PropTypes.string,
    noColorFill: React.PropTypes.string.isRequired,
    onHover: React.PropTypes.func.isRequired,
    subtotalColor: React.PropTypes.string.isRequired,
    variablesTree: React.PropTypes.object.isRequired,
  },
  getDefaultProps: function() {
    return {
      noColorFill: 'gray',
      subtotalColor: 'lightGray',
    };
  },
  render: function() {
    var hasValue = function(variable) { return variable.value; };
    var renderChildren = function(variable) {
      return variable.children.filter(hasValue).map(function(child) {
        var nodes = [renderNode(child)];
        if (child.children) {
          nodes = nodes.concat(renderChildren(child));
        }
        return nodes;
      });
    };
    var renderNode = function(variable) {
      var variableName = variable.name;
      if (variable.code !== rootNode.code && variable.children) {
        variableName = '▾ ' + variableName;
      }
      var isSubtotal = variable.children && variable.depth > 0;
      return (
        <tr
          className={cx({active: variable.code === this.props.activeVariableCode})}
          key={variable.code}
          onMouseOut={this.props.onHover.bind(null, null)}
          onMouseOver={this.props.onHover.bind(null, variable)}>
          <td style={{
            padding: 10,
          }}>
            {
              ! isSubtotal && (
                <div style={{
                  backgroundColor: variable.color ? 'rgb(' + variable.color.join(',') + ')' : this.props.noColorFill,
                  border: '1px solid gray',
                }}>
                  { /* jshint ignore:line */}
                </div>
              )
            }
          </td>
          <td>
            <span onClick={null} style={{
              cursor: 'pointer',
              paddingLeft: (variable.depth - 1) * 20,
            }}>
              {variableName}
            </span>
            {
              variable.url && (
                <a
                  className="btn btn-default btn-xs"
                  href={variable.url}
                  style={{marginLeft: '1em'}}
                  target="_blank"
                  title={'Explication sur ' + variable.name}>
                  ?
                </a>
              )
            }
          </td>
          <td>
            <p className="text-right" style={{
              color: isSubtotal && this.props.subtotalColor,
              fontStyle: isSubtotal && 'italic',
            }}>
              {Math.round(variable.value) + ' €' /* jshint ignore:line */}
            </p>
          </td>
        </tr>
      );
    }.bind(this);
    var rootNode = this.props.variablesTree;
    return (
      <table className="table">
        <tbody>
          {renderChildren(rootNode)}
          {renderNode(rootNode)}
        </tbody>
      </table>
    );
  },
});

module.exports = VariablesTree;
