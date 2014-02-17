define([
	'bootstrap',

	'AcceptCnilConditionsModalV',
	'AcceptCookiesModalV',
	'appV',
	'auth',
	'FormV',
	'router',
	'appconfig'
	],
	function (bootstrap, AcceptCnilConditionsModalV, AcceptCookiesModalV, appV, auth, FormV, Router, appconfig) {

		var App = function () {};
		App.prototype = {
			init: function () {
				this.router = Router.init();
				this.view = appV;
				this.initForm();
				if (appconfig.auth.enable) {
					auth.init(appconfig.auth);
				}
				if (appconfig.displayAcceptCookiesModal) {
					this.acceptCookiesModalV = new AcceptCookiesModalV();
				}
				else if (appconfig.displayAcceptCnilConditionsModal) {
					this.acceptCnilConditionsModalV = new AcceptCnilConditionsModalV();
				}
			},
			initForm: function() {
				this.formV = new FormV();
			}
		};

		var app = new App();
		return app;
});
