/** @jsx React.DOM */
'use strict';

var React = require('react'),
  ReactIntlMixin = require('react-intl');


var JsonVisualization = React.createClass({
  mixins: [ReactIntlMixin],
  propTypes: {
    simulationResult: React.PropTypes.object.isRequired,
    testCase: React.PropTypes.object,
  },
  render: function() {
    var preStyle = {
      background: 'none',
      border: 'none',
      wordWrap: 'normal',
    };
    return (
      <div>
        <div className="alert alert-info" role="alert">
          <p>{this.getIntlMessage('jsonVisualizationExplanation')}</p>
        </div>
        <div className='panel panel-default'>
          <div className="panel-heading">
            <h4 className="panel-title">
              <a data-parent="#accordion" data-toggle="collapse" href='#test-case'>
                {this.getIntlMessage('yourTestCase')}
              </a>
            </h4>
          </div>
          <div className='collapse in panel-collapse' id='test-case'>
            <div className="panel-body">
              <pre style={preStyle}>{JSON.stringify(this.props.testCase, null, 2)}</pre>
            </div>
          </div>
        </div>
        <div className='panel panel-default'>
          <div className="panel-heading">
            <h4 className="panel-title">
              <a data-parent="#accordion" data-toggle="collapse" href='#simulation-result'>
                {this.getIntlMessage('simulationResult')}
              </a>
            </h4>
          </div>
          <div className='collapse in panel-collapse' id='simulation-result'>
            <div className="panel-body">
              <pre style={preStyle}>{JSON.stringify(this.props.simulationResult, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

module.exports = JsonVisualization;
