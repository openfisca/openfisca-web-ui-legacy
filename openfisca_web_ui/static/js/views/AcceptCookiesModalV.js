define([
	'jquery',
	'backbone'
	], function($, Backbone) {
		var AcceptCookiesModalV = Backbone.View.extend({
			el: '#accept-cookies-modal',
			events: {
				'change input[name="accept-checkbox"]': 'updateAcceptButton'
			},

			initialize: function () {
				this.$el.modal('show');
				this.updateAcceptButton();
			},
			updateAcceptButton: function(evt) {
				var $button = this.$el.find('button[name="accept"]');
				if (this.$el.find('input[name="accept-checkbox"]').is(':checked')) {
					$button.removeAttr('disabled');
				} else {
					$button.attr('disabled', 'disabled');
				}
			}
		});
		return AcceptCookiesModalV;
	}
);
