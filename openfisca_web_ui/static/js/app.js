define([
	'jquery',

	'auth',
	'appV',
	'router',
	'appconfig'
	],
	function ($, auth, appV, Router, appconfig) {

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
				if (appconfig.auth.enable) {
					auth.init(appconfig.auth);
				}
			}
		};

		var app = new App();
		return app;
});
