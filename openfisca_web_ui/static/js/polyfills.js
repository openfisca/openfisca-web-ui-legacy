'use strict';


// ECMAScript 6 features
// Polyfills are loaded only if functions are not implemented already.

require('es5-ext/string/#/starts-with/implement');


// Non ECMAScript standard features
// https://github.com/medikoo/es5-ext#non-ecmascript-standard-features
// Define only the array methods actually used in the application code.
// No need to check if they are already implemented since they are non-standard.

for (arrayMethodName in ['contains', 'flatten', 'last']) {
	Object.defineProperty(
		Array.prototype,
		arrayMethodName,
		{
			configurable: true,
			enumerable: false,
			value: require(`es5-ext/array/#/${arrayMethodName}`),
			writable: true,
		}
	);
}
