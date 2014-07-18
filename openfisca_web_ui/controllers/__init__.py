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

from bson import objectid

from .. import contexts, conf, conv, model, templates, urls, uuidhelpers, wsgihelpers
from . import accounts, auth, legislations, sessions, test_cases


email_log = logging.getLogger('email')
router = None


@wsgihelpers.wsgify
def accept_cookies(req):
    ctx = contexts.Ctx(req)
    if not ('accept' in req.params and conv.check(conv.guess_bool(req.params.get('accept-checkbox'))) is True):
        # User doesn't accept the use of cookies => Bye bye.
        return wsgihelpers.redirect(ctx, location = conf['www.url'])
    session = ctx.session
    if session is None:
        session = ctx.session = model.Session()
        session.anonymous_token = uuidhelpers.generate_uuid()
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
def disclaimer_closed(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    session.disclaimer_closed = True
    session.save(safe = True)
    return wsgihelpers.no_content(ctx)


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    if conf['cookie'] in req.cookies:
        update_session(ctx)
        session = ctx.session
        if req.cookies.get(conf['cookie']) != session.token:
            req.response.set_cookie(
                conf['cookie'],
                session.token,
                httponly = True,
                secure = req.scheme == 'https',
                )
    return templates.render(ctx, '/index.mako')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    routings = [
        ('GET', '^/?$', index),
        ('POST', '^/accept-cookies/?$', accept_cookies),
        (None, '^/account(?=/|$)', accounts.route_user),
        (None, '^/admin/accounts(?=/|$)', accounts.route_admin_class),
        (None, '^/admin/legislations(?=/|$)', legislations.route_admin_class),
        (None, '^/admin/sessions(?=/|$)', sessions.route_admin_class),
        (None, '^/api/1/disclaimer_closed$', disclaimer_closed),
        (None, '^/api/1/legislations(?=/|$)', legislations.route_api1_class),
        (None, '^/api/1/test_cases(?=/|$)', test_cases.route_api1_class),
        (None, '^/legislations(?=/|$)', legislations.route_user_class),
        (None, '^/test_cases(?=/|$)', test_cases.route_class),
        ('GET', '^/terms/?$', terms),
        ]
    if conf['enabled.auth']:
        routings.extend([
            ('POST', '^/login/?$', auth.login),
            (('GET', 'POST'), '^/logout/?$', auth.logout),
            ])
        if conf['debug']:
            routings.extend([
                ('GET', '^/login/admin?$', auth.become_admin),
                ('GET', '^/login/user?$', auth.become_user),
                ])
    router = urls.make_router(*routings)
    return router


@wsgihelpers.wsgify
def terms(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/terms.mako')


def update_session(ctx):
    session = ctx.session
    if session is None:
        session = model.Session()
        session.anonymous_token = uuidhelpers.generate_uuid()
        session.token = uuidhelpers.generate_uuid()
    if session.user is None:
        user = model.Account(_id = objectid.ObjectId())
        user.compute_words()
        user.save(safe = True)
        session.user = user
    session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.save(safe = True)
    ctx.session = session
