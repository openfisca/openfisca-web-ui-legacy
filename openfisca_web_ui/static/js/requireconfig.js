require.config({
    urlArgs: "bust=" +  (new Date()).getTime(),
    paths: {

        /* Libs */
        'domReady': 'libs/domReady',
        'jquery': 'libs/jquery-1.9.1.min',
        'underscore': 'libs/underscore-min',
        'backbone': 'libs/backbone-min',
        'backbone.DeepModel': 'libs/backbone-deep-model',
        'handlebars': 'libs/handlebars.runtime-1.0.rc.1.min',
        'templates': '../templates/templates',
        'bootstrap': '//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min',
        'd3': 'libs/d3.v3.min',

        /* App */
        'app': 'app',
        'router': 'router',

        /* Views */
        'appV': 'views/AppV',
        'DetailChartV': 'views/DetailChartV',
        'LocatingChartV': 'views/LocatingChartV',
        'AggregateChart': 'views/modals/AggregateChart',
        'WaterfallChart': 'views/modals/WaterfallChart',

        /* Models */
        'DetailChartM': 'models/DetailChartM',
        'LocatingChartM': 'models/LocatingChartM',


        /* Modules */
        'helpers': 'modules/helpers'
    },
    shim: {
        'jquery':               { exports: '$' },
        'underscore':           { exports: '_' },
        'handlebars':           { exports: 'Handlebars' },
        'bootstrap':            { exports: 'Bootstrap', deps: ['jquery'] },
        'templates':            { exports: 'templates', deps: ['handlebars'] },
        'backbone':             { exports: 'Backbone', deps: ['jquery', 'underscore'] },
        'backbone.DeepModel':   { exports: 'DeepModel', deps: ['backbone'] },
        'd3':                   { exports: 'd3' }
    }
});