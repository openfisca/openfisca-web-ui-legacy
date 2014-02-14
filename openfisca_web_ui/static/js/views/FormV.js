define([
	'jquery',
	'underscore',
	'backbone',

	'backendServiceM',
	],
	function ($, _, Backbone, backendServiceM) {
		var FormV = Backbone.View.extend({
			events: {
				'keypress input': 'submit',
				'submit': 'submit',
				'click .nav-tabs a': 'changeTab',
			},
			model: backendServiceM,
			el: '#form-wrapper',

			initialize: function () {
				console.log('FormV.initialize');
				this.listenTo(this.model, 'change:formData', this.render);
			},
			changeTab: function(evt) {
				evt.preventDefault();
				var tabName = $(evt.target).data('tab-name');
				this.model.fetchForm(tabName);
			},
			render: function () {
				console.log('FormV.render');
				var data = this.model.get('formData');
				this.$el.html(data);
				return this;
			},
			submit: function(evt) {
				if (_.isUndefined(evt.keyCode) || evt.keyCode == 13) {
					evt.preventDefault();
					var $form = this.$el.find('form');
					this.model.validateForm($form.serialize(), this.model.simulate);
				}
			}
		});
		return FormV;
	}
);
