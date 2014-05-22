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


"""Controllers for test cases"""


import collections
import json
import re

from biryani1 import strings
import pymongo
import webob

from .. import contexts, conv, model, paginations, urls, wsgihelpers


@wsgihelpers.wsgify
def api1_current(req):
    ctx = contexts.Ctx(req)
    if req.method == 'POST':
        user = model.get_user(ctx, check = True)
        # TODO use biryani
        data = json.loads(req.body)
        test_case = data.get('test_case')
        user.ensure_test_case()
        current_test_case = user.current_test_case
        current_test_case.api_data = test_case
        current_test_case.save(safe = True)
        return wsgihelpers.no_content(ctx)
    else:
        headers = wsgihelpers.handle_cross_origin_resource_sharing(ctx)
        token, error = conv.input_to_uuid(req.params.get('token'))
        if error is not None:
            return wsgihelpers.respond_json(ctx, data = error, headers = headers)
        session = ctx.session if token is None else model.Session.find_one({'anonymous_token': token})
        # session can be None when simulating in background while accept cookie modal is displayed.
        user = session.user if session is not None else None
        if user is None:
            api_data = None
        else:
            user.ensure_test_case()
            api_data = user.current_test_case.api_data
        return wsgihelpers.respond_json(ctx, data = api_data, headers = headers)


@wsgihelpers.wsgify
def api1_search(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)

    params = req.GET
    inputs = dict(
        page = params.get('page'),
        sort = params.get('sort'),
        term = params.get('term'),
        )
    data, errors = conv.pipe(
        conv.struct(
            dict(
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
        return wsgihelpers.bad_request(ctx, explanation = errors)

    criteria = {'author_id': user._id}
    if data['term'] is not None:
        criteria['words'] = {'$all': [
            re.compile(u'^{}'.format(re.escape(word)))
            for word in data['term']
            ]}
    cursor = model.TestCase.find(criteria, as_class = collections.OrderedDict)
    pager = paginations.Pager(item_count = cursor.count(), page_number = data['page_number'])
    if data['sort'] == 'slug':
        cursor.sort([('slug', pymongo.ASCENDING)])
    elif data['sort'] == 'updated':
        cursor.sort([(data['sort'], pymongo.DESCENDING), ('slug', pymongo.ASCENDING)])
    test_cases = cursor.skip(pager.first_item_index or 0).limit(pager.page_size)

    return wsgihelpers.respond_json(
        ctx,
        [
            {
                'description': test_case.description,
                'isCurrentTestCase': user.current_test_case_id == test_case._id,
                'published': test_case.published.isoformat(),
                'slug': test_case.slug,
                'title': test_case.title,
                'updated': test_case.updated.isoformat(),
                }
            for test_case in test_cases
            ],
        )


@wsgihelpers.wsgify
def delete(req):
    ctx = contexts.Ctx(req)
    test_case = ctx.node
    user = model.get_user(ctx, check = True)
    if user.current_test_case_id == test_case._id:
        user_test_cases = user.test_cases
        if user_test_cases:
            user.current_test_case = user_test_cases[0]
        else:
            user.current_test_case_id = None
        user.save(safe = True)
    test_case.delete(safe = True)
    return wsgihelpers.redirect(ctx, location = user.get_user_url(ctx))


@wsgihelpers.wsgify
def duplicate(req):
    ctx = contexts.Ctx(req)
    test_case = ctx.node
    user = model.get_user(ctx, check = True)
    new_test_case_title = ctx._(u'Copy of {}').format(test_case.title)
    new_test_case = model.TestCase(
        author_id = user._id,
        description = new_test_case_title,
        title = new_test_case_title,
        slug = strings.slugify(new_test_case_title),
        )
    new_test_case.save(safe = True)
    return wsgihelpers.redirect(ctx, location = user.get_user_url(ctx))


@wsgihelpers.wsgify
def edit(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    params = req.params
    inputs = {
        'title': params.get('title'),
        'description': params.get('description'),
        }
    data, errors = conv.struct({
        'title': conv.cleanup_line,
        'description': conv.cleanup_line,
        })(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.bad_request(ctx, explanation = errors)
    test_case = ctx.node
    test_case.description = data['description']
    test_case.slug = strings.slugify(data['title'])
    test_case.title = data['title']
    test_case.save(safe = True)
    return wsgihelpers.redirect(ctx, location = user.get_user_url(ctx))


@wsgihelpers.wsgify
def new(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    params = req.params
    inputs = {
        'title': params.get('title'),
        'description': params.get('description'),
        }
    data, errors = conv.struct({
        'title': conv.cleanup_line,
        'description': conv.cleanup_line,
        })(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.bad_request(ctx, explanation = errors)
    test_case = ctx.node
    test_case = model.TestCase(
        author_id = user._id,
        description = data['description'],
        slug = strings.slugify(data['title']),
        title = data['title'],
        )
    test_case.save(safe = True)
    return wsgihelpers.redirect(ctx, location = user.get_user_url(ctx))


def route(environ, start_response):
    req = webob.Request(environ)
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)

    test_case, error = conv.pipe(
        conv.input_to_slug,
        conv.not_none,
        model.TestCase.make_id_or_slug_or_words_to_instance(),
        )(req.urlvars.get('id_or_slug_or_words'), state = ctx)
    if error is not None:
        return wsgihelpers.not_found(ctx, explanation = error)(environ, start_response)
    if test_case.author_id != user._id:
        return wsgihelpers.forbidden(ctx)

    ctx.node = test_case

    router = urls.make_router(
        ('POST', '^/delete/?$', delete),
        ('GET', '^/duplicate/?$', duplicate),
        ('POST', '^/edit/?$', edit),
        ('GET', '^/use/?$', use),
        )
    return router(environ, start_response)


def route_api1_class(environ, start_response):
    router = urls.make_router(
        (('GET', 'POST'), '^/current?$', api1_current),
        ('GET', '^/search/?$', api1_search),
        )
    return router(environ, start_response)


def route_class(environ, start_response):
    router = urls.make_router(
        # TODO remove or_words
        ('POST', '^/new/?$', new),
        (None, '^/(?P<id_or_slug_or_words>[^/]+)(?=/|$)', route),
        )
    return router(environ, start_response)


@wsgihelpers.wsgify
def use(req):
    ctx = contexts.Ctx(req)
    test_case = ctx.node
    user = model.get_user(ctx, check = True)
    user.current_test_case = test_case
    user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = req.params.get('redirect') or user.get_user_url(ctx))
