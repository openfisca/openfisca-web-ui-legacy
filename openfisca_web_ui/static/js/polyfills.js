function install() {
	// ECMAScript 6 features
	// Polyfills are loaded only if functions are not implemented already.

	require('es5-ext/string/#/starts-with/implement');

	// Non ECMAScript standard features
	// https://github.com/medikoo/es5-ext#non-ecmascript-standard-features
	// Define only the array methods actually used in the application code.
	// No need to check if they are already implemented since they are non-standard.

	Object.defineProperty(
		Array.prototype,
		'contains',
		{
			configurable: true,
			enumerable: false,
			value: require('es5-ext/array/#/contains'),
			writable: true,
		}
	);

	Object.defineProperty(
		Array.prototype,
		'diff',
		{
			configurable: true,
			enumerable: false,
			value: require('es5-ext/array/#/diff'),
			writable: true,
		}
	);

	Object.defineProperty(
		Array.prototype,
		'flatten',
		{
			configurable: true,
			enumerable: false,
			value: require('es5-ext/array/#/flatten'),
			writable: true,
		}
	);

	Object.defineProperty(
		Array.prototype,
		'intersection',
		{
			configurable: true,
			enumerable: false,
			value: require('es5-ext/array/#/intersection'),
			writable: true,
		}
	);

	Object.defineProperty(
		Array.prototype,
		'last',
		{
			configurable: true,
			enumerable: false,
			value: require('es5-ext/array/#/last'),
			writable: true,
		}
	);

	Object.defineProperty(
		Array.prototype,
		'uniq',
		{
			configurable: true,
			enumerable: false,
			value: require('es5-ext/array/#/uniq'),
			writable: true,
		}
	);
}


function valueAsNumber(element) {
	// Polyfill for element.valueAsNumber.
	var value = element.hasOwnProperty('valueAsNumber') ? element.valueAsNumber : parseInt(element.value);
	if (isNaN(value)) {
		value = null;
	}
	return value;
}


module.exports = {install, valueAsNumber};
