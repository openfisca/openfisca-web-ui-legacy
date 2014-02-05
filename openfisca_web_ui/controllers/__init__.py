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

from .. import auth, contexts, conv, matplotlib_helpers, pages, urls, wsgihelpers
from . import accounts, form, sessions, legislations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def image(req):
    ctx = contexts.Ctx(req)
    auth.ensure_session(ctx)
    session = ctx.session
    if session.user.api_data is None:
        session.user.api_data = {}
    simulation_output, simulation_errors = conv.simulation.user_api_data_to_simulation_output(
        session.user.api_data, state = ctx)
    if simulation_errors is None:
        params = {
            'name': req.urlvars.get('name'),
            }
        image_name = conv.check(conv.test_in(['bareme', 'waterfall'])(params['name']))
        trees = simulation_output['value']
        image_stringio = None
        if image_name == 'waterfall':
            image_stringio = matplotlib_helpers.create_waterfall_png(trees)
        elif image_name == 'bareme':
            image_stringio = matplotlib_helpers.create_bareme_png(trees, simulation_output)
        req.response.content_type = 'image/png'
        req.response.write(image_stringio.read())
        return
    return wsgihelpers.no_content(ctx)


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    return wsgihelpers.redirect(ctx, location = '/famille')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    routings = [
        ('GET', '^/?$', index),
        ('GET', '^/image/(?P<name>bareme|waterfall).png/?$', image),
        (None, '^/admin/accounts(?=/|$)', accounts.route_admin_class),
        (None, '^/admin/sessions(?=/|$)', sessions.route_admin_class),
        (None, '^/admin/legislations(?=/|$)', legislations.route_admin_class),
        (None, '^/api/1/accounts(?=/|$)', accounts.route_api1_class),
        (None, '^/api/1/legislations(?=/|$)', legislations.route_api1_class),
        ('POST', '^/login/?$', accounts.login),
        ('POST', '^/logout/?$', accounts.logout),
        ]
    for page_data in pages.pages_data:
        routings.extend([
            (('GET', 'POST'), '^/{slug}/?$'.format(slug=page_data['slug']), form.form, {'page_data': page_data}),
            (('GET', 'POST'), '^/{slug}/(?P<id>)/?$'.format(slug=page_data['slug']), form.all_questions,
             {'page_data': page_data}),
            ])
    router = urls.make_router(*routings)
    return router
