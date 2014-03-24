define([
	'jquery',
	'underscore',
	'backbone',
	'appconfig'
	],
	function ($, _, Backbone, appconfig) {

		var BackendServiceM = Backbone.Model.extend({
			defaults: {
				apiData: {},
				formData: {},
				simulationInProgress: false,
			},
			events: {},
			urlPaths: appconfig.api.urls,

			initialize: function () {},
			saveForm: function(data, callback, options) {
				return $.ajax({
					context: this,
					data: data,
					type: 'POST',
					url: this.urlPaths.form
				})
				.done(function(data/*, textStatus, jqXHR*/) {
					if (data !== null && ! _.isUndefined(data.errors)) {
						console.error('Errors in form', data.errors);
					}
					this.set('formData', data, options);
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error(jqXHR, textStatus, errorThrown);
				})
				.always(function() {
					if ( ! _.isUndefined(callback)) {
						callback();
					}
				});
			},
			simulate: function(data) {
				var reqData = {};
				if (data.axes) {
					reqData.axes = JSON.stringify(data.axes);
				}
				if (data.decomposition) {
					reqData.decomposition = JSON.stringify(data.decomposition);
				}
				this.set('simulationInProgress', true);
				return $.ajax({
					context: this,
					url: this.urlPaths.simulate,
					data: reqData
				})
				.done(function(data) {
					if (data.errors) {
						var errorMessage = 'Erreur de simulation : les paramètres sont probablement incohérents.';
						alert(errorMessage);
						console.error(errorMessage, data);
					} else {
						var result = data.output.value;
						if ( ! _.isUndefined(result)) {
							/*
								Si l'on n'ajoute pas cette propriété,
								et que deux retours de l'api sont identiques,
								le chartM ne considère pas que "apiData" a été mis à jour
								et n'appelle pas le render.
								La propriété _simulationTime permet donc à ChartM de détecter
								qu'une nouvelle simulation a été effectuée même si le jeu de
								donnée renvoyé est le même.
							*/
							result._simulationTime = new Date().getTime();
							this.set('apiData', result);
						}
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error(jqXHR, textStatus, errorThrown);
				}).always(function() {
					this.set('simulationInProgress', false);
				});
			}
		});

		var backendServiceM = new BackendServiceM();
		return backendServiceM;

	}
);
