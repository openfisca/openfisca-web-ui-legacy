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


"""Controllers for accounts"""


import collections
import datetime
import json
import logging
import re

from biryani1 import strings
from formencode import variabledecode
import pymongo
import requests
import webob
import webob.multidict

from .. import conf, contexts, conv, model, paginations, templates, questions, urls, uuidhelpers, wsgihelpers


# TODO parametrize year
DEFAULT_YEAR = 2013

inputs_to_account_admin_data = conv.struct(
    dict(
        admin = conv.pipe(
            conv.guess_bool,
            conv.default(False),
            ),
        email = conv.pipe(
            conv.input_to_email,
            conv.not_none,
            ),
        full_name = conv.pipe(
            conv.cleanup_line,
            conv.not_none,
            ),
        ),
    default = 'drop',
    )
#inputs_to_account_data = conv.struct(
#    dict(
#        email = conv.pipe(
#            conv.input_to_email,
#            conv.not_none,
#            ),
#        full_name = conv.pipe(
#            conv.cleanup_line,
#            conv.not_none,
#            ),
#        ),
#    default = 'drop',
#    )
log = logging.getLogger(__name__)


@wsgihelpers.wsgify
def accept_cnil_conditions(req):
    ctx = contexts.Ctx(req)
    params = req.params
    session = ctx.session
    assert session is not None and session.user is not None
    user = session.user
    if 'accept' in req.params:
        if conv.check(conv.guess_bool(params.get('accept-checkbox'))):
            user.cnil_conditions_accepted = True
        if conv.check(conv.guess_bool(params.get('accept-stats-checkbox'))):
            user.stats_accepted = True
    else:
        user.cnil_conditions_accepted = None
        user.email = None
        user.full_name = None
        user.slug = None
        user.stats_accepted = None
    user.compute_words()
    user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))


@wsgihelpers.wsgify
def admin_delete(req):
    ctx = contexts.Ctx(req)
    account = ctx.node
    model.is_admin(ctx, check = True)
    if req.method == 'POST':
        account.delete(safe = True)
        return wsgihelpers.redirect(ctx, location = model.Account.get_admin_class_url(ctx))
    return templates.render(ctx, '/accounts/admin-delete.mako', account = account)


@wsgihelpers.wsgify
def admin_edit(req):
    ctx = contexts.Ctx(req)
    account = ctx.node
    model.is_admin(ctx, check = True)
    if req.method == 'GET':
        errors = None
        inputs = dict(
            admin = u'1' if account.admin else None,
            email = account.email,
            full_name = account.full_name,
            )
    else:
        assert req.method == 'POST'
        inputs = extract_account_inputs_from_params(ctx, req.POST)
        data, errors = inputs_to_account_admin_data(inputs, state = ctx)
        if errors is None:
            data['slug'], error = conv.pipe(
                conv.input_to_slug,
                conv.not_none,
                )(data['full_name'], state = ctx)
            if error is not None:
                errors = dict(full_name = error)
        if errors is None:
            if model.Account.find(
                    dict(
                        _id = {'$ne': account._id},
                        email = data['email'],
                        ),
                    as_class = collections.OrderedDict,
                    ).count() > 0:
                errors = dict(email = ctx._(u'An account with the same email already exists.'))
            if model.Account.find(
                    dict(
                        _id = {'$ne': account._id},
                        slug = data['slug'],
                        ),
                    as_class = collections.OrderedDict,
                    ).count() > 0:
                errors = dict(full_name = ctx._(u'An account with the same name already exists.'))
            user = model.get_user(ctx)
            assert user is not None
            if not user.admin and user._id != account._id and data['admin']:
                errors = dict(admin = ctx._(u"You can't promote this account to be an administrator, because you aren't"
                    u" an administrator yourself."))
        if errors is None:
            account.set_attributes(**data)
            if account.api_key is None:
                account.api_key = uuidhelpers.generate_uuid()
            account.compute_words()
            account.save(safe = True)

            # View account.
            return wsgihelpers.redirect(ctx, location = account.get_admin_url(ctx))
    return templates.render(ctx, '/accounts/admin-edit.mako', account = account, errors = errors, inputs = inputs)


@wsgihelpers.wsgify
def admin_index(req):
    ctx = contexts.Ctx(req)
    model.is_admin(ctx, check = True)

    assert req.method == 'GET'
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
                term = conv.base.input_to_words,
                ),
            ),
        conv.rename_item('page', 'page_number'),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.bad_request(ctx, explanation = errors)

    criteria = {}
    if data['term'] is not None:
        criteria['words'] = {'$all': [
            re.compile(u'^{}'.format(re.escape(word)))
            for word in data['term']
            ]}
    cursor = model.Account.find(criteria, as_class = collections.OrderedDict)
    pager = paginations.Pager(item_count = cursor.count(), page_number = data['page_number'])
    if data['sort'] == 'slug':
        cursor.sort([('slug', pymongo.ASCENDING)])
    elif data['sort'] == 'updated':
        cursor.sort([(data['sort'], pymongo.DESCENDING), ('slug', pymongo.ASCENDING)])
    accounts = cursor.skip(pager.first_item_index or 0).limit(pager.page_size)
    return templates.render(ctx, '/accounts/admin-index.mako', accounts = accounts, data = data, errors = errors,
        inputs = inputs, pager = pager)


@wsgihelpers.wsgify
def admin_view(req):
    ctx = contexts.Ctx(req)
    account = ctx.node
    model.is_admin(ctx, check = True)
    return templates.render(ctx, '/accounts/admin-view.mako', account = account)


def extract_account_inputs_from_params(ctx, params = None):
    if params is None:
        params = webob.multidict.MultiDict()
    return dict(
        admin = params.get('admin'),
        email = params.get('email'),
        full_name = params.get('full_name'),
        )


@wsgihelpers.wsgify
def login(req):
    """Authorization request."""
    ctx = contexts.Ctx(req)

    assert req.method == 'POST'
    params = req.POST
    inputs = dict(
        assertion = params.get('assertion'),
        )
    data, errors = conv.struct(
        dict(
            assertion = conv.pipe(
                conv.cleanup_line,
                conv.not_none,
                ),
            ),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'Login Error: {0}').format(errors))

    response = requests.post('https://verifier.login.persona.org/verify',
        data = dict(
            audience = urls.get_full_url(ctx),
            assertion = data['assertion'],
            ),
        verify = True,
        )
    if not response.ok:
        return wsgihelpers.internal_error(ctx,
            dump = response.text,
            explanation = ctx._(u'Error while verifying authentication assertion'),
            )
    verification_data = json.loads(response.content)
    # Check if the assertion was valid.
    if verification_data['status'] != 'okay':
        return wsgihelpers.internal_error(ctx,
            dump = response.text,
            explanation = ctx._(u'Error while verifying authentication assertion'),
            )

    registered_account = model.Account.find_one(
        dict(
            email = verification_data['email'],
            ),
        as_class = collections.OrderedDict,
        )
    session = ctx.session
    if session is None:
        ctx.session = session = model.Session()
        session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    if registered_account is None:
        user = session.user
        if user is None:
            user = model.Account()
            user._id = uuidhelpers.generate_uuid()
            user.api_key = uuidhelpers.generate_uuid()
        user.email = verification_data['email']
        user.full_name = verification_data['email']
        user.slug = strings.slugify(user.full_name)
        user.compute_words()
        user.save(safe = True)
        session.user_id = user._id
        session.user = user
    else:
        session.user_id = registered_account._id
        session.user = registered_account
    session.anonymous_token = uuidhelpers.generate_uuid()
    session.token = uuidhelpers.generate_uuid()
    session.save(safe = True)

    req.response.set_cookie(conf['cookie'], session.token, httponly = True, secure = req.scheme == 'https')
    return wsgihelpers.no_content(ctx)


@wsgihelpers.wsgify
def logout(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is not None:
        session.delete(safe = True)
        ctx.session = None
        if req.cookies.get(conf['cookie']) is not None:
            # Generate new cookie to "save" user agreement on cookie policy
            req.response.set_cookie(
                conf['cookie'],
                uuidhelpers.generate_uuid(),
                httponly = True,
                secure = req.scheme == 'https',
                )
    return wsgihelpers.no_content(ctx) if req.is_xhr else templates.render(ctx, '/logout.mako')


def route_admin(environ, start_response):
    req = webob.Request(environ)
    ctx = contexts.Ctx(req)

    account, error = conv.pipe(
        conv.input_to_slug,
        conv.not_none,
        model.Account.make_id_or_slug_or_words_to_instance(),
        )(req.urlvars.get('id_or_slug_or_words'), state = ctx)
    if error is not None:
        return wsgihelpers.not_found(ctx, explanation = error)(environ, start_response)

    ctx.node = account

    router = urls.make_router(
        ('GET', '^/?$', admin_view),
        (('GET', 'POST'), '^/delete/?$', admin_delete),
        (('GET', 'POST'), '^/edit/?$', admin_edit),
        )
    return router(environ, start_response)


def route_admin_class(environ, start_response):
    router = urls.make_router(
        ('GET', '^/?$', admin_index),
        (None, '^/(?P<id_or_slug_or_words>[^/]+)(?=/|$)', route_admin),
        )
    return router(environ, start_response)


def route_user(environ, start_response):
    router = urls.make_router(
        ('GET', '^/?$', user_view_get),
        ('POST', '^/?$', user_view_post),
        ('POST', '^/accept-cnil-conditions/?$', accept_cnil_conditions),
        ('POST', '^/delete/?$', user_delete),
        ('GET', '^/reset/?$', user_reset),
        )
    return router(environ, start_response)


@wsgihelpers.wsgify
def user_delete(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.unauthorized(ctx)

    assert req.method == 'POST'
    session.user.delete(safe = True)
    return wsgihelpers.redirect(ctx, location = urls.get_url(ctx, 'logout'))


@wsgihelpers.wsgify
def user_reset(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.unauthorized(ctx)
    current_test_case = session.user.current_test_case
    if current_test_case is not None:
        current_test_case.api_data = None
        current_test_case.save(safe = True)
    session.user.scenarios = None
    session.user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))


@wsgihelpers.wsgify
def user_view_get(req):
    ctx = contexts.Ctx(req)

    session = ctx.session
    if session is None or session.user is None or session.user.email is None:
        return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))

    scenarios_question = None
    if session.user.email is not None:
        user_scenarios = session.user.scenarios
        if user_scenarios is None:
            legislation = model.Legislation.find_one()
            user_scenarios = [{
                'test_case_id': session.user.current_test_case_id,
                'legislation_id': legislation._id if legislation is not None else None,
                'year': DEFAULT_YEAR,
                }]
        scenarios_question = questions.scenarios.make_scenarios_repeat(session.user)
        values, errors = conv.pipe(
            conv.scenarios.scenarios_to_page_korma_data,
            scenarios_question.root_data_to_str,
            )(user_scenarios, state = ctx)
        scenarios_question.fill(values, errors)
    return templates.render(
        ctx,
        '/accounts/user-view.mako',
        account = session.user,
        scenarios_question = scenarios_question,
        )


@wsgihelpers.wsgify
def user_view_post(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    assert session.user is not None

    scenarios_question = questions.scenarios.make_scenarios_repeat(session.user)
    inputs = variabledecode.variable_decode(req.params)
    data, errors = scenarios_question.root_input_to_data(inputs, state = ctx)
    if errors is None:
        user_scenarios = conv.check(conv.scenarios.korma_data_to_scenarios(data, state = ctx))
        session.user.scenarios = user_scenarios or None
        session.user.save(safe = True)
        if data['my_scenarios'].get('add'):
            if user_scenarios is None:
                user_scenarios = []
            user_scenarios.append({})
            values, errors = conv.pipe(
                conv.scenarios.scenarios_to_page_korma_data,
                scenarios_question.root_data_to_str,
                )(user_scenarios, state = ctx)
            scenarios_question.fill(values, errors)
        else:
            return wsgihelpers.redirect(ctx, location = '')
    else:
        scenarios_question.fill(inputs, errors)
    return templates.render(
        ctx,
        '/accounts/user-view.mako',
        account = session.user,
        scenarios_question = scenarios_question,
        )
