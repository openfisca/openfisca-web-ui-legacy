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


from biryani1 import strings
import webob

from .. import contexts, conv, model, urls, wsgihelpers


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
