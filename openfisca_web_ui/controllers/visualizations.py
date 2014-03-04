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


"""Controllers for visualizations"""


import collections
import pymongo
import re

import webob

from .. import contexts, conv, model, paginations, templates, urls, wsgihelpers


@wsgihelpers.wsgify
def admin_delete():
    pass


@wsgihelpers.wsgify
def admin_edit():
    pass


@wsgihelpers.wsgify
def admin_index():
    pass


@wsgihelpers.wsgify
def admin_new():
    pass


@wsgihelpers.wsgify
def admin_view():
    pass


def route_admin(environ, start_response):
    req = webob.Request(environ)
    ctx = contexts.Ctx(req)

    visualization, error = conv.pipe(
        conv.input_to_slug,
        conv.not_none,
        model.Visualization.make_id_or_slug_or_words_to_instance(),
        )(req.urlvars.get('id_or_slug_or_words'), state = ctx)
    if error is not None:
        return wsgihelpers.not_found(ctx, explanation = ctx._('Visualization Error: {}').format(error))(
            environ, start_response)

    ctx.node = visualization

    router = urls.make_router(
        ('GET', '^/?$', admin_view),
        (('GET', 'POST'), '^/delete/?$', admin_delete),
        (('GET', 'POST'), '^/edit/?$', admin_edit),
        )
    return router(environ, start_response)


def route_admin_class(environ, start_response):
    router = urls.make_router(
        ('GET', '^/?$', admin_index),
        (('GET', 'POST'), '^/new/?$', admin_new),
        (None, '^/(?P<id_or_slug_or_words>[^/]+)(?=/|$)', route_admin),
        )
    return router(environ, start_response)


def route_user(environ, start_response):
    router = urls.make_router(
        ('GET', '^/?$', user_index),
        ('GET', '^/new?$', admin_new),
        ('GET', '^/(?P<id_or_slug>[^/]+)/edit/?$', user_edit),
        ('GET', '^/(?P<id_or_slug>[^/]+)/?$', user_view),
        )
    return router(environ, start_response)


@wsgihelpers.wsgify
def user_edit():
    pass


@wsgihelpers.wsgify
def user_index(req):
    ctx = contexts.Ctx(req)

    params = req.GET
    inputs = dict(
        advanced_search = params.get('advanced_search'),
        page = params.get('page'),
        sort = params.get('sort'),
        term = params.get('term'),
        )
    data, errors = conv.pipe(
        conv.struct(
            dict(
                advanced_search = conv.guess_bool,
                page = conv.pipe(
                    conv.input_to_int,
                    conv.test_greater_or_equal(1),
                    conv.default(1),
                    ),
                sort = conv.pipe(
                    conv.cleanup_line,
                    conv.test_in(['slug', 'updated']),
                    ),
                term = conv.base.input_to_words,
                ),
            ),
        conv.rename_item('page', 'page_number'),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.not_found(ctx, explanation = ctx._('Visualization search error: {}').format(errors))
    criteria = {}
    if data['term'] is not None:
        criteria['words'] = {'$all': [
            re.compile(u'^{}'.format(re.escape(word)))
            for word in data['term']
            ]}
    cursor = model.Visualization.find(criteria, as_class = collections.OrderedDict)
    pager = paginations.Pager(item_count = cursor.count(), page_number = data['page_number'])
    if data['sort'] == 'slug':
        cursor.sort([('slug', pymongo.ASCENDING)])
    elif data['sort'] == 'updated':
        cursor.sort([(data['sort'], pymongo.DESCENDING), ('slug', pymongo.ASCENDING)])
    visualizations = cursor.skip(pager.first_item_index or 0).limit(pager.page_size)
    return templates.render(
        ctx,
        '/visualizations/user-index.mako',
        data = data,
        errors = errors,
        visualizations = visualizations,
        inputs = inputs,
        pager = pager,
        )


@wsgihelpers.wsgify
def user_view():
    pass
