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


"""Controllers for sessions"""


import collections
import logging

import webob

from .. import contexts, conv, model, paginations, templates, urls, wsgihelpers


log = logging.getLogger(__name__)


@wsgihelpers.wsgify
def admin_delete(req):
    ctx = contexts.Ctx(req)
    session = ctx.node
    model.is_admin(ctx, check = True)
    if req.method == 'POST':
        session.delete(safe = True)
        return wsgihelpers.redirect(ctx, location = model.Session.get_admin_class_url(ctx))
    return templates.render(ctx, '/sessions/admin-delete.mako', session = session)


@wsgihelpers.wsgify
def admin_index(req):
    ctx = contexts.Ctx(req)
    model.is_admin(ctx, check = True)

    assert req.method == 'GET'
    page_number, error = conv.pipe(
        conv.input_to_int,
        conv.test_greater_or_equal(1),
        conv.default(1),
        )(req.params.get('page'), state = ctx)
    if error is not None:
        return wsgihelpers.bad_request(ctx, explanation = error)

    cursor = model.Session.find(as_class = collections.OrderedDict)
    pager = paginations.Pager(item_count = cursor.count(), page_number = page_number)
    sessions = cursor.skip(pager.first_item_index or 0).limit(pager.page_size)
    return templates.render(ctx, '/sessions/admin-index.mako', sessions = sessions, pager = pager)


@wsgihelpers.wsgify
def admin_view(req):
    ctx = contexts.Ctx(req)
    session = ctx.node

    model.is_admin(ctx, check = True)

    return templates.render(ctx, '/sessions/admin-view.mako', session = session)


def route_admin(environ, start_response):
    req = webob.Request(environ)
    ctx = contexts.Ctx(req)

    session, error = conv.pipe(
        conv.base.input_to_uuid,
        conv.not_none,
        model.Session.uuid_to_instance,
        )(req.urlvars.get('token'), state = ctx)
    if error is not None:
        return wsgihelpers.not_found(ctx, explanation = error)(environ, start_response)

    ctx.node = session

    router = urls.make_router(
        ('GET', '^/?$', admin_view),
        (('GET', 'POST'), '^/delete/?$', admin_delete),
        )
    return router(environ, start_response)


def route_admin_class(environ, start_response):
    router = urls.make_router(
        ('GET', '^/?$', admin_index),
        (None, '^/(?P<token>[^/]+)(?=/|$)', route_admin),
        )
    return router(environ, start_response)
