define([

	'appV',
	'router',

	'jquery',
	'underscore',
	'backbone'
	],
	function (appV, Router) {

		var App = function () {};
		App.prototype = {
			init: function () {
				this.router = Router.init();
				this.view = appV;
			}
		};

		$.get('/familles', function(data) {
			$('#form-wrapper').html(data);
		});

		var app = new App();
		return app;
});
