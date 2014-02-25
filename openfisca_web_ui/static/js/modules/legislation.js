define(['jquery'], function ($) {

	function init () {
		$('.collapse-node-toggle').on('click', function(evt) {
			evt.preventDefault();
		});

		$('.btn-toggle-open').on('click', function(evt) {
			$('.collapse-node').collapse('show');
		});

		$('.btn-toggle-close').on('click', function(evt) {
			$('.collapse-node').collapse('hide');
		});
	}

	return {init: init};

});
