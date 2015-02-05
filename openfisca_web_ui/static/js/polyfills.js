function isValid(element) {
  // Polyfill for element.validity.valid.
  if (element.hasOwnProperty('validity')) {
    return element.validity.valid;
  } else {
    // Should be enhanced if needed.
    return true;
  }
}


function valueAsNumber(element) {
  // Polyfill for element.valueAsNumber.
  var value = element.hasOwnProperty('valueAsNumber') ? element.valueAsNumber : parseInt(element.value);
  if (isNaN(value)) {
    value = null;
  }
  return value;
}


module.exports = {isValid, valueAsNumber};
