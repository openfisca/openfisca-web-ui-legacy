define([], function () {

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

	return {};
});