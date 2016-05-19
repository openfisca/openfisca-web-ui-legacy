


function smartStepSize(range, nbSteps) {
  // cf http://stackoverflow.com/questions/361681/algorithm-for-nice-grid-line-intervals-on-a-graph
  // Calculate an initial guess at step size.
  var ln10 = Math.log(10);
  var tempStepSize = range / nbSteps;
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


function smartValues(minValue, maxValue, nbSteps) {
  var valuesRange = maxValue - minValue;
  var tickValue = smartStepSize(valuesRange, nbSteps);
  var smartMaxValue = Math.round(maxValue / tickValue + 0.5) * tickValue;
  var smartMinValue = Math.round(minValue / tickValue - 0.5) * tickValue;
  return {maxValue: smartMaxValue, minValue: smartMinValue};
}


function convertLinearRange(value, options) {
  return ((value - options.oldMin) / (options.oldMax - options.oldMin)) *
    (options.newMax - options.newMin) + options.newMin;
}


module.exports = {convertLinearRange, smartStepSize, smartValues};
