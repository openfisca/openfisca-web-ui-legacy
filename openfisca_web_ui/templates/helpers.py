# -*- coding: utf-8 -*-


# OpenFisca -- A versatile microsimulation software
# By: OpenFisca Team <contact@openfisca.fr>
#
# Copyright (C) 2011, 2012, 2013, 2014 OpenFisca Team
# https://github.com/openfisca
#
# This file is part of OpenFisca.
#
# OpenFisca is free software; you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# OpenFisca is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


"""Template helpers"""


import urlparse

from .. import conf, model, urls, uuidhelpers


def admin_appconfig(ctx):
    appconfig = base_appconfig(ctx)
    if conf['enabled.auth']:
        # Admin pages should redirect to home page on logout.
        appconfig['enabledModules']['auth']['redirectLocation'] = urls.get_url(ctx)
    return appconfig


def base_appconfig(ctx):
    """Config of JS modules included on each page."""
    req = ctx.req
    session = ctx.session
    user = model.get_user(ctx)
    enabled_modules = {}
    if conf['cookie'] not in req.cookies:
        enabled_modules['acceptCookiesModal'] = True
    elif user is not None and user.email is not None and not user.cnil_conditions_accepted:
        enabled_modules['acceptCnilConditionsModal'] = True
    if conf['enabled.auth']:
        enabled_modules['auth'] = {
            'currentUser': user.email if user is not None else None,
            }
    if session is not None and not session.disclaimer_closed:
        enabled_modules['disclaimer'] = {
            'disclaimerClosedUrlPath': urls.get_url(ctx, 'api/1/disclaimer_closed'),
            }
    if conf['enabled.charts.locating']:
        enabled_modules['locatingChart'] = {
            'nvd3CssUrlPath': urls.get_url(ctx, u'bower/nvd3/nv.d3.css'),
            }
    appconfig = {
        'debug': conf['debug'],
        'enabledModules': enabled_modules,
        }
    return appconfig


def build_requireconfig(ctx):
    return {
        'urlArgs': u'bust={}'.format(uuidhelpers.url_bust()),
        'paths': {
            # Bower components
            'backbone': urls.get_url(ctx, u'bower/backbone/backbone'),
            'bootstrap': urls.get_url(ctx, u'bower/bootstrap/dist/js/bootstrap'),
            'd3': urls.get_url(ctx, u'bower/d3/d3'),
            'domReady': urls.get_url(ctx, u'bower/requirejs-domready/domReady'),
            'hbs': urls.get_url(ctx, u'bower/require-handlebars-plugin/hbs'),
            'jquery': urls.get_url(ctx, u'bower/jquery/dist/jquery'),
            'json': urls.get_url(ctx, u'bower/requirejs-json/json'),
            'nvd3': urls.get_url(ctx, u'bower/nvd3/nv.d3'),
            'text': urls.get_url(ctx, u'bower/requirejs-text/text'),
            'underscore': urls.get_url(ctx, u'/bower/underscore/underscore'),
            'x-editable': urls.get_url(ctx, u'/bower/x-editable/dist/bootstrap3-editable/js/bootstrap-editable'),

            # App
            'app': urls.get_url(ctx, u'js/app'),
            'router': urls.get_url(ctx, u'js/router'),

            # Views
            'AcceptCnilConditionsModalV': urls.get_url(ctx, u'js/views/AcceptCnilConditionsModalV'),
            'AcceptCookiesModalV': urls.get_url(ctx, u'js/views/AcceptCookiesModalV'),
            'AggregateChartV': urls.get_url(ctx, u'js/views/modals/AggregateChartV'),
            'chartsV': urls.get_url(ctx, u'js/views/chartsV'),
            'DistributionChartV': urls.get_url(ctx, u'js/views/DistributionChartV'),
            'LocatingChartV': urls.get_url(ctx, u'js/views/LocatingChartV'),
            'SituationFormV': urls.get_url(ctx, u'js/views/SituationFormV'),
            'VisualizationsPaneV': urls.get_url(ctx, u'js/views/VisualizationsPaneV'),
            'WaterfallChartV': urls.get_url(ctx, u'js/views/WaterfallChartV'),

            # Models
            'backendServiceM': urls.get_url(ctx, u'js/models/backendServiceM'),
            'chartM': urls.get_url(ctx, u'js/models/chartM'),
            'VisualizationsPaneM': urls.get_url(ctx, u'js/models/VisualizationsPaneM'),

            # Modules
            'auth': urls.get_url(ctx, u'js/modules/auth'),
            'disclaimer': urls.get_url(ctx, u'js/modules/disclaimer'),
            'helpers': urls.get_url(ctx, 'js/modules/helpers'),
            'legislation': urls.get_url(ctx, u'js/modules/legislation'),
            'parser': urls.get_url(ctx, 'js/modules/parser'),

            # External libs
            # You must include this on every page which uses navigator.id functions.
            # Because Persona is still in development, you should not self-host the include.js file.
            'persona': urlparse.urljoin(conf['persona.url'], 'include'),
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


def index_appconfig(ctx):
    appconfig = base_appconfig(ctx)
    appconfig['enabledModules'].update({
        'situationForm': True,
        'visualizations': {
            'searchUrlPath': urls.get_url(ctx, 'api/1/visualizations/search'),
            },
        })
    appconfig['api'] = {
        'urls': {
            'form': urls.get_url(ctx, '/'),
            'simulate': urls.get_url(ctx, 'api/1/simulate'),
            },
        }
    return appconfig


def legislation_appconfig(ctx, legislation_url):
    appconfig = base_appconfig(ctx)
    appconfig['enabledModules']['legislation'] = {
        'legislationUrl': legislation_url
        }
    return appconfig


def logout_appconfig(ctx):
    appconfig = base_appconfig(ctx)
    appconfig['enabledModules']['auth']['logout'] = True
    return appconfig


def user_view_appconfig(ctx):
    appconfig = base_appconfig(ctx)
    if conf['enabled.auth']:
        appconfig['enabledModules']['auth']['redirectLocation'] = urls.get_url(ctx)
    return appconfig
