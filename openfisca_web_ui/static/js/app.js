define([
	'bootstrap',

	'appconfig'
	],
	function (bootstrap, appconfig) {
		var App = function () {};
		App.prototype = {
			init: function () {
				var enabledModules = appconfig.enabledModules;
				if (enabledModules.acceptCookiesModal) {
					require(['AcceptCookiesModalV'], function(AcceptCookiesModalV) {
						this.acceptCookiesModalV = new AcceptCookiesModalV();
					});
				}
				else if (enabledModules.acceptCnilConditionsModal) {
					require(['AcceptCnilConditionsModalV'], function(AcceptCnilConditionsModalV) {
						this.acceptCnilConditionsModalV = new AcceptCnilConditionsModalV();
					});
				}
				if (enabledModules.auth) {
					require(['auth'], function(auth) {
						auth.init(enabledModules.auth);
					});
				}
				if (enabledModules.disclaimer) {
					require(['disclaimer'], function(disclaimer) {
						disclaimer.init(enabledModules.disclaimer);
					});
				}
				if (enabledModules.legislation) {
					require(['legislation'], function(legislation) {
						legislation.init();
					});
				}
				if (enabledModules.situationForm) {
					require(['appV', 'router', 'SituationFormV'], function(appV, router, SituationFormV) {
						this.router = router.init();
						this.appV = appV;
						this.situationFormV = new SituationFormV();
					});
				}
			}
		};

		var app = new App();
		return app;
});
