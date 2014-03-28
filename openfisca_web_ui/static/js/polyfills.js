define(function () {
	'use strict';

	function installConsolePolyfill() {
		if (typeof window.console === 'undefined') {
			window.console = {};
			var alertFallback = false;
			var polyfillMethod = function(msg) {
				if (alertFallback) {
					alert(msg);
				}
			};
			var methodNames = ['error', 'info', 'log'];
			for (var methodIndex in methodNames) {
				var methodName = methodNames[methodIndex];
				if (typeof window.console[methodName] === 'undefined') {
					window.console[methodName] = polyfillMethod;
				}
			}
		}
	}

	function init() {
		installConsolePolyfill();
	}

	return {init: init};
});
