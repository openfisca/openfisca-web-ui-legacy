define([
	'jquery',

	'appV',
	'router',
	],
	function ($, appV, Router) {

		var App = function () {};
		App.prototype = {
			init: function () {
				this.router = Router.init();
				this.view = appV;
				$.get('/familles', function(data) {
					$('#form-wrapper').html(data);
					$('input').on('keypress', function(evt) {
						if (evt.keyCode == 13) {
							evt.preventDefault();
							$("form#simulation").submit();
						}
					});
				});
			}
		};

		var app = new App();
		return app;
});
