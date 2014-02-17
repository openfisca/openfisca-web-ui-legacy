define([
	'jquery',
	'backbone'
	], function($, Backbone) {
		var AcceptCnilConditionsModalV = Backbone.View.extend({
			el: '#accept-cnil-conditions-modal',
			events: {
				'change input[name="accept-checkbox"]': 'updateAcceptButton',
				'click button[name="reject"]': 'logout'
			},

			initialize: function () {
				this.$el.modal('show');
				this.updateAcceptButton();
			},
			logout: function() {
				navigator.id.logout();
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
		return AcceptCnilConditionsModalV;
	}
);
