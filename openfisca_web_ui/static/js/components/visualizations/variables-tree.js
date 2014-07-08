/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

var cx = React.addons.classSet;


var VariablesTree = React.createClass({
  propTypes: {
    activeVariableCode: React.PropTypes.string,
    onHover: React.PropTypes.func.isRequired,
    variables: React.PropTypes.array.isRequired,
  },
  render: function() {
    return (
      <table className="table">
        <tbody>
          {
            this.props.variables.map(function(variable) {
              return (
                <tr
                  className={cx({active: variable.code === this.props.activeVariableCode})}
                  key={variable.code}
                  onMouseOver={this.props.onHover.bind(null, variable)}>
                  <th>
                    <span onClick={null} style={{
                      cursor: 'pointer',
                      paddingLeft: (variable.depth - 1) * 20,
                    }}>
                      <span className="glyphicon glyphicon-minus"></span> {variable.name}
                    </span>
                    {
                      variable.url && (
                        <a
                          className="btn btn-default btn-xs"
                          href={variable.url}
                          target="_blank"
                          title={'Explication sur ' + variable.name}>
                          ?
                        </a>
                      )
                    }
                  </th>
                  <td className="text-right"></td>
                </tr>
              );
            }, this)
          }
        </tbody>
      </table>
    );
  }
});

module.exports = VariablesTree;
