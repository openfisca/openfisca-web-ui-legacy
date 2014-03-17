define(['underscore'], function (_) {

	function installConsolePolyfill() {
		if (typeof console === "undefined") {
			console = {};
			var alertFallback = false;
			var polyfillMethod = function(msg) {
				if (alertFallback) {
					alert(msg);
				}
			};
			var methodNames = ['error', 'info', 'log'];
			for (var methodIndex in methodNames) {
				var methodName = methodNames[methodIndex];
				if (typeof console[methodName] === "undefined") {
					console[methodName] = polyfillMethod;
				}
			}
		}
	}

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
		};

		installConsolePolyfill();
	}

	_.mixin({
		findDeep: function(items, attrs) {
			function match(value) {
				for (var key in attrs) {
					if (attrs[key] !== value[key]) {
						return false;
					}
				}
				return true;
			}
			function traverse(value) {
				var result;
				if (match(value)) {
					return value;
				}
				_.forEach(value.children, function (val) {
					if (result) {
						return false;
					}
					if (match(val)) {
						result = val;
						return false;
					}
					if (_.isObject(val.children) || _.isArray(val.children)) {
						result = traverse(val);
					}
				});
				return result;
			}
			return traverse(items);
		}
	});

	return {installPolyfills: installPolyfills};
});

