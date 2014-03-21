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
			fetchForm: function() {
				return $.ajax({
					context: this,
					url: this.urlPaths.form
				})
				.done(function(data) {
					this.set('formData', {html: data});
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('fetchForm fail', jqXHR, textStatus, errorThrown);
				});
			},
			saveForm: function(data, callback) {
				return $.ajax({
					context: this,
					data: data,
					type: 'POST',
					url: this.urlPaths.form
				})
				.done(function(data, textStatus, jqXHR) {
					if (data !== null && ! _.isUndefined(data.errors)) {
						console.error('Errors in form', data.errors);
					}
					this.set('formData', data === null ? {} : data);
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
			simulate: function(decomposition, axes) {
				/* Decomposition & axes */
				var reqAdditionalData = {};
				// FIXME do not send null values, and use data arg.
				if( ! _.isUndefined(decomposition)) {
					reqAdditionalData.decomposition = JSON.stringify(decomposition);
				}
				if( ! _.isUndefined(axes)) {
					reqAdditionalData.axes = JSON.stringify(axes);
				}
				this.set('simulationInProgress', true);
				return $.ajax({
					context: this,
					url: this.urlPaths.simulate,
					data: reqAdditionalData
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
