define(['jquery'], function ($) {
	'use strict';

	function init (config) {
		$('.alert.disclaimer').on('close.bs.alert', function () {
			$.get(config.disclaimerClosedUrlPath);
		});
	}

	return {init: init};

});
