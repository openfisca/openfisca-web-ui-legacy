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


import datetime
import logging

from biryani1 import strings

from .. import contexts, conf, conv, model, pages, templates, urls, uuidhelpers, wsgihelpers
from . import accounts, forms, legislations, sessions, simulations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def accept_cookies(req):
    ctx = contexts.Ctx(req)
    assert req.method == 'POST'
    if not ('accept' in req.params and conv.check(conv.guess_bool(req.params.get('accept-checkbox'))) is True):
        # User doesn't accept the use of cookies => Bye bye.
        return wsgihelpers.redirect(ctx, location = conf['www.url'])
    session = ctx.session
    if session is None:
        session = ctx.session = model.Session()
        session.token = uuidhelpers.generate_uuid()
    session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.save(safe = True)
    response = wsgihelpers.redirect(ctx, location = urls.get_url(ctx))
    if ctx.req.cookies.get(conf['cookie']) != session.token:
        response.set_cookie(
            conf['cookie'],
            session.token,
            httponly = True,
            secure = ctx.req.scheme == 'https',
            )
    return response


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if conf['cookie'] in req.cookies:
        if session is None:
            session = ctx.session = model.Session()
            session.token = uuidhelpers.generate_uuid()
        if session.user is None:
            user = model.Account()
            user._id = uuidhelpers.generate_uuid()
            user.compute_words()
            simulation_date = datetime.datetime.utcnow()
            simulation_title = u'Ma simulation du {} à {}'.format(
                datetime.datetime.strftime(simulation_date, u'%d/%m/%Y'),
                datetime.datetime.strftime(simulation_date, u'%H:%M'),
                )
            simulation = model.Simulation(
                author_id = user._id,
                title = simulation_title,
                slug = strings.slugify(simulation_title),
                )
            simulation.save(safe = True)
            user.current_simulation = simulation
            user.simulations_id = [simulation._id]
            user.save(safe = True)
            session.user = user
        session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
        session.save(safe = True)
        if ctx.req.cookies.get(conf['cookie']) != session.token:
            ctx.req.response.set_cookie(
                conf['cookie'],
                session.token,
                httponly = True,
                secure = ctx.req.scheme == 'https',
                )
    return templates.render(ctx, '/index.mako')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    routings = [
        ('GET', '^/?$', index),
        (('GET', 'POST'), '^/accept-cookies/?$', accept_cookies),
        (None, '^/accounts(?=/|$)', accounts.route_user),
        (None, '^/admin/accounts(?=/|$)', accounts.route_admin_class),
        (None, '^/admin/legislations(?=/|$)', legislations.route_admin_class),
        (None, '^/admin/sessions(?=/|$)', sessions.route_admin_class),
        (None, '^/api/1/accounts(?=/|$)', accounts.route_api1_class),
        (None, '^/api/1/legislations(?=/|$)', legislations.route_api1_class),
        (None, '^/api/1/simulate$', simulate),
        (None, '^/legislations(?=/|$)', legislations.route_user),
        (None, '^/simulations(?=/|$)', simulations.route),
        ('POST', '^/login/?$', accounts.login),
        (('GET', 'POST'), '^/logout/?$', accounts.logout),
        ('GET', '^/terms/?$', terms),
        ]
    for page_data in pages.pages_data:
        routings.extend([
            ('GET', '^/api/1/form/{slug}/?$'.format(slug=page_data['slug']), forms.get, {'page_data': page_data}),
            ('POST', '^/api/1/form/{slug}/?$'.format(slug=page_data['slug']), forms.post, {'page_data': page_data}),
            ])
    router = urls.make_router(*routings)
    return router


@wsgihelpers.wsgify
def simulate(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    data = None
    user_scenarios = session.user.scenarios if session is not None and session.user is not None else None
    if user_scenarios is None:
        user_api_data = session.user.current_api_data if session is not None and session.user is not None else None
        if user_api_data is None:
            user_api_data = {}
        output, errors = conv.simulations.user_api_data_to_simulation_output(user_api_data, state = ctx)
        data = {'output': output, 'errors': errors}
    else:
        output, errors = conv.simulations.scenarios_to_simulation_output(user_scenarios, state = ctx)
        data = {'output': output, 'errors': errors}
    return wsgihelpers.respond_json(ctx, data)


@wsgihelpers.wsgify
def terms(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/terms.mako')
