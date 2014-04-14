define([
	'AcceptCnilConditionsModalV',
	'AcceptCookiesModalV',
	'auth',
	'chartsV',
	'disclaimer',
	'legislation',
	'router',
	'SituationFormV',

	'appconfig',
],
function (AcceptCnilConditionsModalV, AcceptCookiesModalV, auth, chartsV, disclaimer, legislation, router,
	SituationFormV, appconfig) {
	'use strict';

	function init () {
		var enabledModules = appconfig.enabledModules;
		if (enabledModules.auth) {
			auth.init(enabledModules.auth);
		}
		if (enabledModules.acceptCookiesModal) {
			window.acceptCookiesModalV = new AcceptCookiesModalV();
		}
		else if (enabledModules.acceptCnilConditionsModal) {
			window.acceptCnilConditionsModalV = new AcceptCnilConditionsModalV();
		}
		if ( ! enabledModules.acceptCookiesModal && ! enabledModules.acceptCnilConditionsModal) {
			if (enabledModules.disclaimer) {
				disclaimer.init(enabledModules.disclaimer);
			}
		}
		if (enabledModules.legislation) {
			legislation.init(enabledModules.legislation);
		}
		if (enabledModules.situationForm) {
			window.chartsV = chartsV;
			window.router = router.init();
			window.situationFormV = new SituationFormV({el: '#form-wrapper'});
		}
	}

	return {init: init};
});
