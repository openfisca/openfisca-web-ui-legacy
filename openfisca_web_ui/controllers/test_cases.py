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


"""Controllers for simulations"""


import babel.dates
import datetime

from biryani1 import strings

from .. import contexts, conv, model, urls, wsgihelpers


@wsgihelpers.wsgify
def delete(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    id_or_slug = req.urlvars.get('id_or_slug')
    test_case = conv.check(
        model.TestCase.make_id_or_slug_or_words_to_instance(user_id = user._id)(id_or_slug, state = ctx)
        )
    if test_case is None or test_case._id not in user.test_cases_id:
        return wsgihelpers.not_found(ctx)

    user.test_cases_id.remove(test_case._id)
    if len(user.test_cases_id) == 0:
        test_case.delete(safe = True)
        test_case_title = babel.dates.format_datetime(datetime.datetime.utcnow())
        test_case = model.TestCase(
            author_id = user._id,
            title = test_case_title,
            slug = strings.slugify(test_case_title),
            )
        test_case.save(safe = True)
        user.current_test_case = test_case
        user.test_cases_id = [test_case._id]
    elif user.current_test_case == test_case:
        user.current_test_case_id = user.test_cases_id[0]
        test_case.delete(safe = True)
    user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = user.get_user_url(ctx))


@wsgihelpers.wsgify
def duplicate(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    id_or_slug = req.urlvars.get('id_or_slug')
    test_case = conv.check(
        model.TestCase.make_id_or_slug_or_words_to_instance(user_id = user._id)(id_or_slug, state = ctx)
        )
    if test_case is None or test_case._id not in user.test_cases_id:
        return wsgihelpers.not_found(ctx)

    del test_case._id
    test_case.description = u'Copie de la simulation {}'.format(test_case.title)
    test_case.title = u'{} « (Copie) »'.format(test_case.title)
    test_case.slug = strings.slugify(test_case.title)
    test_case.save(safe = True)
    if user.test_cases_id is None:
        user.test_cases_id = [test_case._id]
        user.current_test_case_id = test_case._id
        user.save(safe = True)
    elif test_case._id not in user.test_cases_id:
        user.test_cases_id.append(test_case._id)
        user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = user.get_user_url(ctx))


@wsgihelpers.wsgify
def edit(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    params = req.params
    inputs = {
        'title': params.get('title'),
        'description': params.get('description'),
        'id_or_slug': req.urlvars.get('id_or_slug'),
        }
    data, errors = conv.pipe(
        conv.struct({
            'title': conv.cleanup_line,
            'description': conv.cleanup_line,
            'id_or_slug': conv.first_match(
                conv.test(lambda id: id == 'new'),
                model.TestCase.make_id_or_slug_or_words_to_instance(user_id = user._id),
                ),
            }),
        conv.rename_item('id_or_slug', 'test_case'),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.bad_request(ctx, explanation = errors)

    if data['test_case'] == 'new':
        data['test_case'] = model.TestCase(
            author_id = user._id,
            description = data['description'],
            title = data['title'],
            slug = strings.slugify(data['title']),
            )
        data['test_case'].api_data = None
        data['test_case'].save(safe = True)
        if user.test_cases_id is None:
            user.test_cases_id = [data['test_case']._id]
            user.current_test_case_id = data['test_case']._id
            user.save(safe = True)
        elif data['test_case']._id not in user.test_cases_id:
            user.test_cases_id.append(data['test_case']._id)
            user.current_test_case_id = data['test_case']._id
            user.save(safe = True)
        return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))

    if data['test_case'] is None or data['test_case']._id not in user.test_cases_id:
        return wsgihelpers.not_found(ctx)

    data['test_case'].title = data['title']
    data['test_case'].slug = strings.slugify(data['title'])
    data['test_case'].description = data['description']
    data['test_case'].save(safe = True)
    return wsgihelpers.redirect(ctx, location = user.get_user_url(ctx))


def route(environ, start_response):
    router = urls.make_router(
        ('POST', '^/(?P<id_or_slug>[^/]+)/delete/?$', delete),
        ('GET', '^/(?P<id_or_slug>[^/]+)/duplicate/?$', duplicate),
        ('POST', '^/(?P<id_or_slug>[^/]+)/edit/?$', edit),
        ('GET', '^/(?P<id_or_slug>[^/]+)/use/?$', use),
        )
    return router(environ, start_response)


@wsgihelpers.wsgify
def use(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    id_or_slug = req.urlvars.get('id_or_slug')
    test_case = conv.check(
        model.TestCase.make_id_or_slug_or_words_to_instance(user_id = user._id)(id_or_slug, state = ctx)
        )
    if test_case is None or test_case._id not in user.test_cases_id:
        return wsgihelpers.not_found(ctx)
    user.current_test_case = test_case
    user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = req.params.get('redirect') or user.get_user_url(ctx))
