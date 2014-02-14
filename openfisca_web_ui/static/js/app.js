define([
	'bootstrap',

	'auth',
	'appV',
	'FormV',
	'router',
	'appconfig'
	],
	function (bootstrap, auth, appV, FormV, Router, appconfig) {

		var App = function () {};
		App.prototype = {
			init: function () {
				this.router = Router.init();
				this.view = appV;
				this.initForm();
				if (appconfig.auth.enable) {
					auth.init(appconfig.auth);
				}
			},
			initForm: function() {
				this.formV = new FormV();
			}
		};

		var app = new App();
		return app;
});
