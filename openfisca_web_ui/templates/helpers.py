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
        enabled_modules['acceptCookiesModal'] = {
            'actionUrlPath': urls.get_url(ctx, 'accept-cookies'),
            }
    elif user is not None and user.email is not None and not user.cnil_conditions_accepted:
        enabled_modules['acceptCnilConditionsModal'] = {
            'actionUrlPath': user.get_user_url(ctx, 'accept-cnil-conditions'),
            'termsUrlPath': urls.get_url(ctx, 'terms'),
            }
    if conf['enabled.auth']:
        dummy_emails = (conf['auth.dummy_admin_email'], conf['auth.dummy_user_email'])
        enabled_modules['auth'] = {
            'currentUser': user.email if user is not None else None,
            'isDummy': user is not None and user.email in dummy_emails,
            'logoutUrlPath': urls.get_url(ctx, 'logout'),
            }
    if conf['enabled.disclaimer'] and session is not None and not session.disclaimer_closed:
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


def index_appconfig(ctx):
    appconfig = base_appconfig(ctx)
    appconfig['api'] = {
        'urls': {
            'fields': conf['api.urls.fields'],
            'simulate': conf['api.urls.simulate'],
            },
        }
    appconfig['constants'] = {
        'defaultYear': conf['ui.default_year'],
        'maxYear': conf['ui.max_year'],
        'minYear': conf['ui.min_year'],
        }
    appconfig['enabledModules'].update({
        'charts': {
            'urlPaths': {
                'legislationsSearch': urls.get_url(ctx, 'api/1/legislations/search'),
                'testCasesSearch': urls.get_url(ctx, 'api/1/test_cases/search'),
                'testCasesBaseUrl': urls.get_url(ctx, u'test_cases'),
                'visualizationsSearch': urls.get_url(ctx, 'api/1/visualizations/search'),
                },
            },
        'situationForm': {
            'urlPaths': {
                'currentTestCase': urls.get_url(ctx, u'api/1/test_cases/current'),
                },
            },
        })
    appconfig['www.url'] = conf['www.url']
    appconfig['api'] = {
        'urls': {
            'calculate': conf['api.urls.calculate'],
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
