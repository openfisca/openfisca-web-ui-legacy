define([
	'bootstrap',

	'AcceptCnilConditionsModalV',
	'AcceptCookiesModalV',
	'appV',
	'auth',
	'disclaimerV',
	'FormV',
	'router',
	'appconfig'
	],
	function (bootstrap, AcceptCnilConditionsModalV, AcceptCookiesModalV, appV, auth, disclaimerV, FormV, Router,
		appconfig) {

		var App = function () {};
		App.prototype = {
			init: function () {
				this.router = Router.init();
				this.view = appV;
				// TODO add a condition to avoid loading simulation on each page.
				disclaimerV.init(appconfig.disclaimer);
				this.formV = new FormV();
				if (appconfig.auth.enable) {
					auth.init(appconfig.auth);
				}
				if (appconfig.displayAcceptCookiesModal) {
					this.acceptCookiesModalV = new AcceptCookiesModalV();
				}
				else if (appconfig.displayAcceptCnilConditionsModal) {
					this.acceptCnilConditionsModalV = new AcceptCnilConditionsModalV();
				}
			}
		};

		var app = new App();
		return app;
});
