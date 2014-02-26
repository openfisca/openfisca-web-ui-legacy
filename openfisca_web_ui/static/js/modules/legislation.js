define(['jquery', 'moment', 'x-editable'], function ($) {

	function init (config) {

		$('.editable-date').editable({
			type: 'combodate',
			format: 'DD/MM/YYYY',
			url: config.legislationUrl,
			pk: 1,
			title: 'Appliquer cette legislation à une nouvelle date',
		});

		//turn to inline mode
		$.fn.editable.defaults.mode = 'inline';

		// editable
		$('.editable').editable({
			type: 'text',
			url: config.legislationUrl,
			pk: 1,
			title: 'Nouvelle valeur',
		});

		$('.collapse-node-toggle').on('click', function(evt) {
			evt.preventDefault();
		});

		$('.btn-expand-all').on('click', function(evt) {
			$('.collapse-node-toggle.collapsed').removeClass('collapsed');
			$('.collapse-node.collapse').addClass('in').removeClass('collapse').css({height: ''});
		});

		$('.btn-collapse-all').on('click', function(evt) {
			$('.collapse-node-toggle').addClass('collapsed');
			$('.collapse-node').addClass('collapse').removeClass('in');
		});
	}

	return {init: init};

});
