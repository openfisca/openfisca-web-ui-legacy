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
    assert req.method == 'POST'

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx)

    id_or_slug = req.urlvars.get('id_or_slug')
    test_case = conv.check(
        model.TestCase.make_id_or_slug_or_words_to_instance(user_id = session.user._id)(id_or_slug, state = ctx)
        )
    if test_case is None or test_case._id not in session.user.test_cases_id:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(id_or_slug))

    session.user.test_cases_id.remove(test_case._id)
    if len(session.user.test_cases_id) == 0:
        test_case.delete(safe = True)
        test_case_date = datetime.datetime.utcnow()
        test_case_title = u'Ma simulation du {}'.format(babel.dates.format_datetime(test_case_date)),
        test_case = model.TestCase(
            author_id = session.user._id,
            title = test_case_title,
            slug = strings.slugify(test_case_title),
            )
        test_case.save(safe = True)
        session.user.current_test_case = test_case
        session.user.test_cases_id = [test_case._id]
    elif session.user.current_test_case == test_case:
        session.user.current_test_case_id = session.user.test_cases_id[0]
        test_case.delete(safe = True)
    session.user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = session.user.get_user_url(ctx))


@wsgihelpers.wsgify
def duplicate(req):
    ctx = contexts.Ctx(req)

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx)

    id_or_slug = req.urlvars.get('id_or_slug')
    test_case = conv.check(
        model.TestCase.make_id_or_slug_or_words_to_instance(user_id = session.user._id)(id_or_slug, state = ctx)
        )
    if test_case is None or test_case._id not in session.user.test_cases_id:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(id_or_slug))

    del test_case._id
    test_case.description = u'Copie de la simulation {}'.format(test_case.title)
    test_case.title = u'{} « (Copie) »'.format(test_case.title)
    test_case.slug = strings.slugify(test_case.title)
    test_case.save(safe = True)
    if session.user.test_cases_id is None:
        session.user.test_cases_id = [test_case._id]
        session.user.current_test_case_id = test_case._id
        session.user.save(safe = True)
    elif test_case._id not in session.user.test_cases_id:
        session.user.test_cases_id.append(test_case._id)
        session.user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = session.user.get_user_url(ctx))


@wsgihelpers.wsgify
def edit(req):
    ctx = contexts.Ctx(req)
    assert req.method == 'POST'

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx)

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
                model.TestCase.make_id_or_slug_or_words_to_instance(user_id = session.user._id),
                ),
            }),
        conv.rename_item('id_or_slug', 'test_case'),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.bad_request(ctx, explanation = errors)

    if data['test_case'] == 'new':
        data['test_case'] = model.TestCase(
            author_id = session.user._id,
            description = data['description'],
            title = data['title'],
            slug = strings.slugify(data['title']),
            )
        data['test_case'].api_data = None
        data['test_case'].save(safe = True)
        if session.user.test_cases_id is None:
            session.user.test_cases_id = [data['test_case']._id]
            session.user.current_test_case_id = data['test_case']._id
            session.user.save(safe = True)
        elif data['test_case']._id not in session.user.test_cases_id:
            session.user.test_cases_id.append(data['test_case']._id)
            session.user.current_test_case_id = data['test_case']._id
            session.user.save(safe = True)
        return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))

    if data['test_case'] is None or data['test_case']._id not in session.user.test_cases_id:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(data['id_or_slug']))

    data['test_case'].title = data['title']
    data['test_case'].slug = strings.slugify(data['title'])
    data['test_case'].description = data['description']
    data['test_case'].save(safe = True)
    return wsgihelpers.redirect(ctx, location = session.user.get_user_url(ctx))


def route(environ, start_response):
    router = urls.make_router(
#        ('POST', '^/save/?$', save),
        ('POST', '^/(?P<id_or_slug>[^/]+)/delete/?$', delete),
        ('GET', '^/(?P<id_or_slug>[^/]+)/duplicate/?$', duplicate),
        ('POST', '^/(?P<id_or_slug>[^/]+)/edit/?$', edit),
        ('GET', '^/(?P<id_or_slug>[^/]+)/use/?$', use),
        )
    return router(environ, start_response)


@wsgihelpers.wsgify
def use(req):
    ctx = contexts.Ctx(req)

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx)

    id_or_slug = req.urlvars.get('id_or_slug')
    test_case = conv.check(
        model.TestCase.make_id_or_slug_or_words_to_instance(user_id = session.user._id)(id_or_slug, state = ctx)
        )
    if test_case is None or test_case._id not in session.user.test_cases_id:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(id_or_slug))

    session.user.current_test_case = test_case
    session.user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))
