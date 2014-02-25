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


def base_appconfig(ctx):
    """Config of JS modules included on each page."""
    req = ctx.req
    session = ctx.session
    user = model.get_user(ctx)
    enabled_modules = {}
    if conf['auth.enable']:
        enabled_modules['auth'] = {
            'currentUser': user.email if user is not None else None,
            }
    if session is not None and not session.disclaimer_closed:
        enabled_modules['disclaimer'] = {
            'disclaimerClosedUrlPath': urls.get_url(ctx, 'api/1/disclaimer_closed'),
            }
    if conf['cookie'] not in req.cookies:
        enabled_modules['acceptCookiesModal'] = True
    elif user is not None and user.email is not None and not user.cnil_conditions_accepted:
        enabled_modules['acceptCnilConditionsModal'] = True
    appconfig = {
        'debug': conf['debug'],
        'enabledModules': enabled_modules,
        }
    return appconfig


def index_appconfig(ctx):
    appconfig = base_appconfig(ctx)
    appconfig['enabledModules']['situationForm'] = True
    appconfig['api'] = {
        'urls': {
            'form': urls.get_url(ctx, '/'),
            'simulate': urls.get_url(ctx, 'api/1/simulate'),
            },
        }
    return appconfig


def legislation_appconfig(ctx):
    appconfig = base_appconfig(ctx)
    appconfig['enabledModules']['legislation'] = True
    return appconfig
