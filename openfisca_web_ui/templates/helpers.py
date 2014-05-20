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


from .. import conf, model, urls


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
        enabled_modules['locatingChart'] = True
    appconfig = {
        'debug': conf['debug'],
        'enabledModules': enabled_modules,
        }
    return appconfig


def build_requireconfig(ctx):
    requireconfig = {'shim': build_requireconfig_shim()}
#    if conf['debug']:
#        requireconfig['urlArgs'] = u'bust={}'.format(uuidhelpers.url_bust())
    if not conf['dev.build_js']:
        requireconfig['paths'] = build_requireconfig_paths(static_prefix = urls.get_url(ctx))
    return requireconfig


def build_requireconfig_paths(static_prefix):
    """This function is shared between build_requireconfig and build.js used by r.js."""
    bower_prefix = static_prefix + u'bower/'
    data_prefix = static_prefix + u'data/'
    js_prefix = static_prefix + u'js/'
    components_prefix = js_prefix + u'components/'
    templates_prefix = static_prefix + u'templates/'
    models_prefix = js_prefix + u'models/'
    views_prefix = js_prefix + u'views/'
    return {
        # Bower components
        'amd-loader': bower_prefix + u'amd-loader/amd-loader',
        'backbone': bower_prefix + u'backbone/backbone',
        'bootstrap': bower_prefix + u'bootstrap/dist/js/bootstrap',
        'd3': bower_prefix + u'd3/d3',
        'hbs': bower_prefix + u'require-handlebars-plugin/hbs',
        'jquery': bower_prefix + u'jquery/dist/jquery',
        'json': bower_prefix + u'requirejs-json/json',
        'nvd3': bower_prefix + u'nvd3/nv.d3',
        'Q': bower_prefix + u'q/q',
        'ractive': bower_prefix + u'ractive/ractive',
        'rv': bower_prefix + u'requirejs-ractive/rv',
        'text': bower_prefix + u'requirejs-text/text',
        'underscore': bower_prefix + u'underscore/underscore',
        'x-editable': bower_prefix + u'x-editable/dist/bootstrap3-editable/js/bootstrap-editable',

        # Components
        'situationForm': components_prefix + u'situationForm',

        # Data
        'vingtilesD': data_prefix + 'vingtiles.json',

        # Modules
        'auth': js_prefix + u'auth',
        'app': js_prefix + u'app',
        'disclaimer': js_prefix + u'disclaimer',
        'helpers': js_prefix + 'helpers',
        'legislation': js_prefix + u'legislation',
        'parser': js_prefix + 'parser',
        'polyfills': js_prefix + 'polyfills',
        'router': js_prefix + u'router',

        # Models
        'chartsM': models_prefix + u'chartsM',
        'legislationsServiceM': models_prefix + u'legislationsServiceM',
        'LocatingChartM': models_prefix + u'LocatingChartM',
        'testCasesServiceM': models_prefix + u'testCasesServiceM',
        'visualizationsServiceM': models_prefix + u'visualizationsServiceM',

        # Templates
        'chartsT': templates_prefix + u'charts',
        'situationFormT': templates_prefix + u'situation-form',

        # Views
        'AcceptCnilConditionsModalV': views_prefix + u'AcceptCnilConditionsModalV',
        'AcceptCookiesModalV': views_prefix + u'AcceptCookiesModalV',
        'AggregateChartV': views_prefix + u'modals/AggregateChartV',
        'chartsV': views_prefix + u'chartsV',
        'DistributionChartV': views_prefix + u'DistributionChartV',
        'IframeChartV': views_prefix + u'IframeChartV',
        'LocatingChartV': views_prefix + u'LocatingChartV',
        'WaterfallChartV': views_prefix + u'WaterfallChartV',
        }


def build_requireconfig_shim():
    """This function is shared between build_requireconfig and build.js used by r.js."""
    return {
        'backbone': {'exports': 'Backbone', 'deps': ['jquery', 'underscore']},
        'bootstrap': {'exports': 'Bootstrap', 'deps': ['jquery']},
        'd3': {'exports': 'd3'},
        'jquery': {'exports': '$'},
        'nvd3': {'exports': 'nv', 'deps': ['d3']},
        'underscore': {'exports': '_'},
        'x-editable': {'deps': ['bootstrap']},
        }


def index_appconfig(ctx):
    appconfig = base_appconfig(ctx)
    appconfig['constants'] = {
        # TODO parametrize year values
        'defaultYear': 2013,
        'maxYear': 2099,
        'minYear': 1870,
        }
    appconfig['enabledModules'].update({
        'charts': {
            'urlPaths': {
                'legislationsSearch': urls.get_url(ctx, 'api/1/legislations/search'),
                'testCasesSearch': urls.get_url(ctx, 'api/1/test_cases/search'),
                'visualizationsSearch': urls.get_url(ctx, 'api/1/visualizations/search'),
                },
            },
        'situationForm': {
            'urlPaths': {
                'currentTestCase': urls.get_url(ctx, u'api/1/test_cases/current'),
                },
            },
        })
    appconfig['api'] = {
        'urls': {
            'fields': conf['api.urls.fields'],
            'simulate': conf['api.urls.simulate'],
            },
        }
    return appconfig


def legislation_appconfig(ctx, legislation_edit_url):
    appconfig = base_appconfig(ctx)
    appconfig['enabledModules']['legislation'] = {
        'legislationEditUrl': legislation_edit_url,
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
