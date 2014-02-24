define(['jquery', 'x-editable'], function ($) {

	function init (config) {

		//turn to inline mode
		$.fn.editable.defaults.mode = 'inline';

		// editable
		$('.editable').editable({
			type: 'text',
			url: config.legislationUrl,
			pk: 1,
			placement: 'inline',
			title: 'Nouvelle valeur',
			source: '/list'
		});


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
