require.config({
    urlArgs: "bust=" +  (new Date()).getTime(),
    paths: {
        /* Bower components */
        'backbone': '/bower/backbone/backbone',
        'backbone.DeepModel': '/bower/backbone-deep-model/distribution/deep-model',
        'bootstrap': '/bower/bootstrap/dist/js/bootstrap',
        'd3': '/bower/d3/d3',
        'domReady': '/bower/requirejs-domready/domReady',
        'handlebars': '/bower/handlebars/handlebars.amd',
        'jquery': '/bower/jquery/jquery.min',
        'templates': '../templates/templates',
        'underscore': '/bower/underscore/underscore',

        /* App */
        'app': '/js/app',
        'router': '/js/router',

        /* Views */
        'appV': '/js/views/AppV',
        'CnilModal': '/js/views/CnilModal',
        'LocatingChartV': '/js/views/LocatingChartV',
        'AggregateChartV': '/js/views/modals/AggregateChartV',
        'WaterfallChartV': '/js/views/WaterfallChartV',

        /* Models */
        'DetailChartM': '/js/models/DetailChartM',
        'LocatingChartM': '/js/models/LocatingChartM',

        /* Modules */
        'auth': '/js/auth',
        'helpers': '/js/modules/helpers'
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
