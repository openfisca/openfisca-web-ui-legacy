define(['jquery', 'x-editable'], function ($) {

	function init (config) {

		//turn to inline mode
		$.fn.editable.defaults.mode = 'inline';

		// editable
		$('.editable').editable({
			escape: true,
			type: 'text',
			url: config.legislationUrl,
			pk: 1,
			title: 'Nouvelle valeur',
			success: function(response, newValue) {
				if (response.status == 'error') {
					//msg will be shown in editable form
					return response.msg;
				}
			}
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
