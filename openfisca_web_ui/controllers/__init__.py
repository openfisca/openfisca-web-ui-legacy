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


"""Root controllers"""


import logging

from .. import contexts, conv, pages, templates, urls, wsgihelpers
from . import accounts, form, legislations, sessions, simulations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/index.mako')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    routings = [
        ('GET', '^/?$', index),
        (None, '^/admin/accounts(?=/|$)', accounts.route_admin_class),
        (None, '^/accounts(?=/|$)', accounts.route_user_class),
        (None, '^/admin/sessions(?=/|$)', sessions.route_admin_class),
        (None, '^/admin/legislations(?=/|$)', legislations.route_admin_class),
        (None, '^/api/1/accounts(?=/|$)', accounts.route_api1_class),
        (None, '^/api/1/legislations(?=/|$)', legislations.route_api1_class),
        (None, '^/api/1/simulate$', simulate),
        (None, '^/simulations(?=/|$)', simulations.route),
        ('POST', '^/login/?$', accounts.login),
        (('GET', 'POST'), '^/logout/?$', accounts.logout),
        ]
    for page_data in pages.pages_data:
        routings.append(
            (('GET', 'POST'), '^/api/1/form/{slug}/?$'.format(slug=page_data['slug']), form.form,
             {'page_data': page_data}),
            )
    router = urls.make_router(*routings)
    return router


@wsgihelpers.wsgify
def simulate(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    user_api_data = session.user.api_data if session.user is not None else None
    if user_api_data is None:
        user_api_data = {}
    output, errors = conv.simulation.user_api_data_to_simulation_output(user_api_data, state = ctx)
    data = {'output': output, 'errors': errors}
    return wsgihelpers.respond_json(ctx, data)
