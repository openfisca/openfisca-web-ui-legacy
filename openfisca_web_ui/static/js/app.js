define([
	'bootstrap',

	'appconfig'
	],
	function (bootstrap, appconfig) {

		function init () {
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
			if ( ! enabledModules.acceptCookiesModal && ! enabledModules.acceptCnilConditionsModal) {
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
			}
			if (enabledModules.legislation) {
				require(['legislation'], function(legislation) {
					legislation.init(enabledModules.legislation);
				});
			}
			if (enabledModules.situationForm) {
				require(['nvd3', 'appV', 'router', 'SituationFormV'], function(nvd3, appV, router, SituationFormV) {
					nvd3.dev = appconfig.debug;
					this.router = router.init();
					this.appV = appV;
					this.situationFormV = new SituationFormV();
				});
			}
		}

		return {init: init};
});
