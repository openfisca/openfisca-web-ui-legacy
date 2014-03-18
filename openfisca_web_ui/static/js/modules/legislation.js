define(['jquery', 'underscore', 'x-editable'], function ($, _, xeditable) {

	function init (config) {

		//turn to inline mode
		$.fn.editable.defaults.mode = 'inline';

		var editableOptions = {
			type: 'text',
			url: config.legislationUrl,
			pk: 1,
			title: 'Nouvelle valeur'
		};

		// editable
		$('.editable').editable(editableOptions);
		$('.editable').on('save', function () {
			var $tbody = $(this).parents('tbody');
			var $trs = $tbody.find('tr')
			$tbody.html('');

			_.map(_.sortBy($trs, function(item) {
				return $(item).find('.editable').first().text();
			}), function(item, index) {
				$item = $(item);
				$item.find('.editable').each(function() {
					var $this = $(this);
					var name = $this.data('name');
					name[name.length - 2] = index;
					$this.data('name', name);
				})
				$tbody.append($(item));
			});

			$tbody.find('.editable').editable(editableOptions)
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

		$('.period-select').on('change', function(evt) {
			$(this).parent().next('ul.nav-tabs').find('li a').eq($(this).val()).tab('show');
		});

		$('.btn-add-slice').on('click', function(evt) {
			var $tbody = $(this).prev('table').find('tbody');
			var $tr = $tbody.find('tr').first().clone();
			$tr.find('.editable')
				.text('');
				.editable(editableOptions);
			$tbody.prepend($tr);
		});

		$('.btn-delete-slice').on('click', function(evt) {
			var url = config.legislationUrl;
			var params = {
				action: 'delete',
				name: $(this).data('name')
			};
			var $that = $(this);
			$.post(url, params)
			.done(function(data) {
				$that.closest('tr').detach();
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				console.error('Delete slice failed', jqXHR, textStatus, errorThrown, jqXHR.responseText);
				navigator.id.logout();
				// TODO : Translate string
				alert("Slice hasn't been deleted");
			});
		});
	}

	return {init: init};

});
