define([], function () {

	function installPolyfills() {
		Object._length = function(obj) {
			var size = 0, key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) size++;
			}
			return size;
		};


		Object._concat = function (obj1, obj2) {
			for (var key in obj2) {
				obj1[key] = obj2[key];
			}
			return obj1;
		}

		var alertFallback = false;
		if (typeof console === "undefined") {
			console = {};
			var methodNames = ['error', 'info', 'log'];
			for (methodName in methodNames) {
				if (typeof console[methodName] === "undefined") {
					console[methodName] = function(msg) {
						if (alertFallback) {
							alert(msg);
						}
					};
				}
			}
		}
	}

	return {installPolyfills: installPolyfills};
});
