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


"""Controllers for legislations"""


import collections
import datetime
import json
import logging
import re
import requests

import pymongo
import webob
import webob.multidict

from .. import contexts, conf, conv, model, paginations, templates, urls, wsgihelpers


inputs_to_legislation_data = conv.struct(
    dict(
        author_id = conv.input_to_uuid,
        datetime_begin = conv.function(lambda string: datetime.datetime.strptime(string, u'%d-%m-%Y')),
        datetime_end = conv.function(lambda string: datetime.datetime.strptime(string, u'%d-%m-%Y')),
        description = conv.cleanup_text,
        json = conv.pipe(
            conv.cleanup_line,
            conv.make_input_to_json(),
            conv.not_none,
            ),
        title = conv.pipe(
            conv.cleanup_line,
            conv.not_none,
            ),
        ),
    default = 'drop',
    )
log = logging.getLogger(__name__)


@wsgihelpers.wsgify
def admin_delete(req):
    ctx = contexts.Ctx(req)
    legislation = ctx.node

    if not model.is_admin(ctx):
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("Deletion forbidden"),
            message = ctx._("You can not delete a legislation."),
            title = ctx._('Operation denied'),
            )

    if req.method == 'POST':
        legislation.delete(ctx, safe = True)
        return wsgihelpers.redirect(ctx, location = model.Legislation.get_admin_class_url(ctx))
    return templates.render(ctx, '/legislations/admin-delete.mako', legislation = legislation)


@wsgihelpers.wsgify
def admin_edit(req):
    ctx = contexts.Ctx(req)
    legislation = ctx.node

    if not model.is_admin(ctx):
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("Deletion forbidden"),
            message = ctx._("You can not delete a legislation."),
            title = ctx._('Operation denied'),
            )

    if req.method == 'GET':
        errors = None
        inputs = dict(
            datetime_begin = datetime.datetime.strftime(legislation.datetime_begin, u'%d-%m-%Y'),
            datetime_end = datetime.datetime.strftime(legislation.datetime_end, u'%d-%m-%Y'),
            description = legislation.description,
            json = legislation.json,
            title = legislation.title,
        )
    else:
        assert req.method == 'POST'
        inputs = extract_legislation_inputs_from_params(ctx, req.POST)
        data, errors = inputs_to_legislation_data(inputs, state = ctx)
        if errors is None:
            data['slug'], error = conv.pipe(
                conv.input_to_slug,
                conv.not_none,
                )(data['title'], state = ctx)
            if error is not None:
                errors = dict(title = error)
        if errors is None:
            try:
                response = requests.post(
                    conf['api.legislations.url'],
                    headers = {
                        'Content-Type': 'application/json',
                        'User-Agent': conf['app_name'],
                        },
                    data = json.dumps(dict(value = data['json'])),
                    )
            except requests.exceptions.ConnectionError:
                error = ctx._('Unable to connect to API, url: {}').format(conf['api.url'])
            if not response.ok:
                try:
                    error = response.json(object_pairs_hook = collections.OrderedDict)
                except ValueError as exc:
                    error = unicode(exc)
            if error is not None:
                errors = dict(json = error)
            else:
                legislation.json = response.json(object_pairs_hook = collections.OrderedDict)
        if errors is None:
            if model.Legislation.find(
                    dict(
                        _id = {'$ne': legislation._id},
                        slug = data['slug'],
                        ),
                    as_class = collections.OrderedDict,
                    ).count() > 0:
                errors = dict(email = ctx._('A legislation with the same name already exists.'))
        if errors is None:
            legislation.set_attributes(**data)
            legislation.compute_words()
            legislation.save(ctx, safe = True)

            # View legislation.
            return wsgihelpers.redirect(ctx, location = legislation.get_admin_url(ctx))
    return templates.render(ctx, '/legislations/admin-edit.mako', errors = errors, inputs = inputs,
        legislation = legislation)


@wsgihelpers.wsgify
def admin_index(req):
    ctx = contexts.Ctx(req)
#    model.is_admin(ctx, check = True)

    assert req.method == 'GET'
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
                term = conv.input_to_words,
                ),
            ),
        conv.rename_item('page', 'page_number'),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.not_found(ctx, explanation = ctx._('Legislation search error: {}').format(errors))

    criteria = {}
    if data['term'] is not None:
        criteria['words'] = {'$all': [
            re.compile(u'^{}'.format(re.escape(word)))
            for word in data['term']
            ]}
    cursor = model.Legislation.find(criteria, as_class = collections.OrderedDict)
    pager = paginations.Pager(item_count = cursor.count(), page_number = data['page_number'])
    if data['sort'] == 'slug':
        cursor.sort([('slug', pymongo.ASCENDING)])
    elif data['sort'] == 'updated':
        cursor.sort([(data['sort'], pymongo.DESCENDING), ('slug', pymongo.ASCENDING)])
    legislations = cursor.skip(pager.first_item_index or 0).limit(pager.page_size)
    return templates.render(ctx, '/legislations/admin-index.mako', data = data, errors = errors,
        legislations = legislations, inputs = inputs, pager = pager)


@wsgihelpers.wsgify
def admin_new(req):
    ctx = contexts.Ctx(req)

    user = model.get_user(ctx)
    if user is None:
        return wsgihelpers.unauthorized(ctx,
            explanation = ctx._("Creation unauthorized"),
            message = ctx._("You can not create a legislation."),
            title = ctx._('Operation denied'),
            )

    legislation = model.Legislation()
    if req.method == 'GET':
        errors = None
        inputs = extract_legislation_inputs_from_params(ctx)
    else:
        assert req.method == 'POST'
        inputs = extract_legislation_inputs_from_params(ctx, req.POST)
        inputs['author_id'] = user._id
        data, errors = inputs_to_legislation_data(inputs, state = ctx)
        if errors is None:
            data['slug'], error = conv.pipe(
                conv.input_to_slug,
                conv.not_none,
                )(data['title'], state = ctx)
            if error is not None:
                errors = dict(title = error)
        if errors is None:
            try:
                response = requests.post(
                    conf['api.legislations.url'],
                    headers = {
                        'Content-Type': 'application/json',
                        'User-Agent': conf['app_name'],
                        },
                    data = json.dumps(dict(value = data['json'])),
                    )
            except requests.exceptions.ConnectionError:
                error = ctx._('Unable to connect to API, url: {}').format(conf['api.url'])
            if not response.ok:
                try:
                    error = response.json(object_pairs_hook = collections.OrderedDict)
                except ValueError as exc:
                    error = unicode(exc)
            if error is not None:
                errors = dict(json = error)
            else:
                legislation.json = response.json(object_pairs_hook = collections.OrderedDict)
        if errors is None:
            if model.Legislation.find(
                    dict(
                        slug = data['slug'],
                        ),
                    as_class = collections.OrderedDict,
                    ).count() > 0:
                errors = dict(full_name = ctx._('A legislation with the same name already exists.'))
        if errors is None:
            legislation.set_attributes(**data)
            legislation.compute_words()
            legislation.save(ctx, safe = True)

            # View legislation.
            return wsgihelpers.redirect(ctx, location = legislation.get_admin_url(ctx))
    return templates.render(ctx, '/legislations/admin-new.mako', errors = errors, inputs = inputs,
        legislation = legislation)


@wsgihelpers.wsgify
def admin_view(req):
    ctx = contexts.Ctx(req)
    legislation = ctx.node

    return templates.render(ctx, '/legislations/admin-view.mako', legislation = legislation)


@wsgihelpers.wsgify
def api1_typeahead(req):
    ctx = contexts.Ctx(req)
    headers = wsgihelpers.handle_cross_origin_resource_sharing(ctx)

    assert req.method == 'GET'
    params = req.GET
    inputs = dict(
        q = params.get('q'),
        )
    data, errors = conv.struct(
        dict(
            q = conv.input_to_words,
            ),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.not_found(ctx, explanation = ctx._('Legislation search error: {}').format(errors))

    criteria = {}
    if data['q'] is not None:
        criteria['words'] = {'$all': [
            re.compile(u'^{}'.format(re.escape(word)))
            for word in data['q']
            ]}
    cursor = model.Legislation.get_collection().find(criteria, ['title'])
    return wsgihelpers.respond_json(ctx,
        [
            legislation_attributes['title']
            for legislation_attributes in cursor.limit(10)
            ],
        headers = headers,
        )


def extract_legislation_inputs_from_params(ctx, params = None):
    if params is None:
        params = webob.multidict.MultiDict()
    return dict(
        datetime_begin = params.get('datetime_begin'),
        datetime_end = params.get('datetime_end'),
        description = params.get('description'),
        json = params.get('json'),
        title = params.get('title'),
        )


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)

    assert req.method == 'GET'
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
                term = conv.input_to_words,
                ),
            ),
        conv.rename_item('page', 'page_number'),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.not_found(ctx, explanation = ctx._('Legislation search error: {}').format(errors))

    criteria = {}
    if data['term'] is not None:
        criteria['words'] = {'$all': [
            re.compile(u'^{}'.format(re.escape(word)))
            for word in data['term']
            ]}
    cursor = model.Legislation.find(criteria, as_class = collections.OrderedDict)
    pager = paginations.Pager(item_count = cursor.count(), page_number = data['page_number'])
    if data['sort'] == 'slug':
        cursor.sort([('slug', pymongo.ASCENDING)])
    elif data['sort'] == 'updated':
        cursor.sort([(data['sort'], pymongo.DESCENDING), ('slug', pymongo.ASCENDING)])
    legislations = cursor.skip(pager.first_item_index or 0).limit(pager.page_size)
    return templates.render(ctx, '/legislations/index.mako', data = data, errors = errors, legislations = legislations,
        inputs = inputs, pager = pager)


def route_admin(environ, start_response):
    req = webob.Request(environ)
    ctx = contexts.Ctx(req)

    legislation, error = conv.pipe(
        conv.input_to_slug,
        conv.not_none,
        model.Legislation.id_or_words_to_instance,
        )(req.urlvars.get('id_or_slug_or_words'), state = ctx)
    if error is not None:
        return wsgihelpers.not_found(ctx, explanation = ctx._('Legislation Error: {}').format(error))(
            environ, start_response)

    ctx.node = legislation

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


def route_api1_class(environ, start_response):
    router = urls.make_router(
        ('GET', '^/typeahead/?$', api1_typeahead),
        )
    return router(environ, start_response)
