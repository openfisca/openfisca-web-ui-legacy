## -*- coding: utf-8 -*-


## OpenFisca -- A versatile microsimulation software
## By: OpenFisca Team <contact@openfisca.fr>
##
## Copyright (C) 2011, 2012, 2013, 2014 OpenFisca Team
## https://github.com/openfisca
##
## This file is part of OpenFisca.
##
## OpenFisca is free software; you can redistribute it and/or modify
## it under the terms of the GNU Affero General Public License as
## published by the Free Software Foundation, either version 3 of the
## License, or (at your option) any later version.
##
## OpenFisca is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU Affero General Public License for more details.
##
## You should have received a copy of the GNU Affero General Public License
## along with this program.  If not, see <http://www.gnu.org/licenses/>.


<%doc>
    Configure requirejs, paths in particular.
</%doc>


<%!
from openfisca_web_ui import urls, uuidhelpers
%>


<%def name="requireconfig_script()" filter="trim">
<%
requireconfig = {
    'urlArgs': u'bust={}'.format(uuidhelpers.url_bust()),
    'paths': {
        # Bower components
        'backbone': urls.get_url(ctx, u'bower/backbone/backbone'),
        'bootstrap': urls.get_url(ctx, u'bower/bootstrap/dist/js/bootstrap'),
        'd3': urls.get_url(ctx, u'bower/d3/d3'),
        'domReady': urls.get_url(ctx, u'bower/requirejs-domready/domReady'),
        'jquery': urls.get_url(ctx, u'bower/jquery/jquery'),
        'nvd3': urls.get_url(ctx, u'bower/nvd3/nv.d3'),
        'underscore': urls.get_url(ctx, u'/bower/underscore/underscore'),

        # App
        'app': urls.get_url(ctx, u'js/app'),
        'router': urls.get_url(ctx, u'js/router'),

        # Views
        'AcceptCnilConditionsModalV': urls.get_url(ctx, u'js/views/AcceptCnilConditionsModalV'),
        'AcceptCookiesModalV': urls.get_url(ctx, u'js/views/AcceptCookiesModalV'),
        'AggregateChartV': urls.get_url(ctx, u'js/views/modals/AggregateChartV'),
        'appV': urls.get_url(ctx, u'js/views/appV'),
        'auth': urls.get_url(ctx, u'js/views/auth'),
        'disclaimer': urls.get_url(ctx, u'js/views/disclaimer'),
        'DistributionChartV': urls.get_url(ctx, u'js/views/DistributionChartV'),
        'legislation': urls.get_url(ctx, u'js/views/legislation'),
        'LocatingChartV': urls.get_url(ctx, u'js/views/LocatingChartV'),
        'SituationFormV': urls.get_url(ctx, u'js/views/SituationFormV'),
        'WaterfallChartV': urls.get_url(ctx, u'js/views/WaterfallChartV'),

        # Models
        'backendServiceM': urls.get_url(ctx, u'js/models/backendServiceM'),
        'DetailChartM': urls.get_url(ctx, u'js/models/DetailChartM'),
        'LocatingChartM': urls.get_url(ctx, u'js/models/LocatingChartM'),
        'DistributionChartM': urls.get_url(ctx, u'js/models/DistributionChartM'),

        # Modules
        'helpers': urls.get_url(ctx, 'js/modules/helpers')
        },
    'shim': {
        'backbone': {'exports': 'Backbone', 'deps': ['jquery', 'underscore']},
        'bootstrap': {'exports': 'Bootstrap', 'deps': ['jquery']},
        'd3': {'exports': 'd3'},
        'jquery': {'exports': '$'},
        'nvd3': {'exports': 'nv', 'deps': ['d3']},
        'underscore': {'exports': '_'},
        },
    }
%>\
require.config(${requireconfig | n, js});
</%def>
