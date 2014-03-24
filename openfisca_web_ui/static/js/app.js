define([
	'bootstrap',

	'appconfig'
	],
	function (bootstrap, appconfig) {

		function init () {
			var enabledModules = appconfig.enabledModules;
			if (enabledModules.auth) {
				require(['auth'], function(auth) {
					auth.init(enabledModules.auth);
				});
			}
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
				require(['chartsV', 'router', 'SituationFormV'], function(chartsV, router, SituationFormV) {
					this.router = router.init();
					this.chartsV = chartsV;
					this.situationFormV = new SituationFormV({el: '#form-wrapper'});
				});
			}
		}

		return {init: init};
});
