/** @jsx React.DOM */
'use strict';

var React = require('react');


function calculateStepSize(range, stepsCount) {
  // cf http://stackoverflow.com/questions/361681/algorithm-for-nice-grid-line-intervals-on-a-graph
  // Calculate an initial guess at step size.
  var ln10 = Math.log(10);
  var tempStepSize = range / stepsCount;
  // Get the magnitude of the step size.
  var mag = Math.floor(Math.log(tempStepSize) / ln10);
  var magPow = Math.pow(10, mag);
  // Calculate most significant digit of the new step size.
  var magMsd = Math.round(tempStepSize / magPow + 0.5);
  // Promote the MSD to either 2, 5 or 10.
  if (magMsd > 5.0) {
    magMsd = 10.0;
  } else if (magMsd > 2.0) {
    magMsd = 5.0;
  } else if (magMsd > 1.0) {
    magMsd = 2.0;
  }
  return magMsd * magPow;
}

var YAxis = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    steps: React.PropTypes.number.isRequired,
  },
  getDefaultProps: function() {
    return {
      height: 100,
      maxValue: 100,
      steps: 10,
    };
  },
  render: function() {
    var stepSize = calculateStepSize(this.props.maxValue, this.props.steps);
    return (
      <g className="y-axis" transform={'translate(' + this.props.marginLeft + ', 0)'}>
        <path
          d={'M-6,' + this.props.marginTop + 'H0V' + this.props.height - this.props.marginBottom + 'H-6'}
          style={{fill: 'none', stroke: 'black', shapeRendering: 'crispedges'}}
        />
        {
          barsData.yAxisLabels.map(function(yAxisLabel, yAxisIndex) {
            var translateY = this.props.height - this.props.marginBottom - yAxisIndex * barsData.tickHeight;
            return (
              <g
                style={{opacity: 1}}
                transform={'translate(0, ' + translateY + ')'}>
                <text
                  style={{textAnchor: 'end', fontFamily: 'sans-serif', fontSize: 12}}
                  dy=".32em"
                  x="-9"
                  y="0">
                  {yAxisLabel}
                </text>
                <line
                  style={{fill: 'none', stroke: 'black', shapeRendering: 'crispedges'}}
                  x2="-6"
                  y2="0"
                />
                <line
                  style={{fill: 'none', stroke: 'lightgray', opacity: 0.8}}
                  x2={this.props.width - this.props.marginLeft - this.props.marginRight}
                  y2="0"
                />
              </g>
            );
          })
        }
      </g>
    );
  }
});

module.exports = YAxis;
