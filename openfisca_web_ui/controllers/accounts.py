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
import logging
import re
import pymongo
import webob
import webob.multidict

from .. import contexts, conv, model, paginations, templates, urls, uuidhelpers, wsgihelpers


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
log = logging.getLogger(__name__)


@wsgihelpers.wsgify
def accept_cnil_conditions(req):
    ctx = contexts.Ctx(req)
    params = req.params
    user = model.get_user(ctx, check = True)
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
            user = model.get_user(ctx, check = True)
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
        ('GET', '^/?$', user_view),
        ('POST', '^/accept-cnil-conditions/?$', accept_cnil_conditions),
        ('POST', '^/delete/?$', user_delete),
        ('GET', '^/reset/?$', user_reset),
        )
    return router(environ, start_response)


@wsgihelpers.wsgify
def user_delete(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    if user.email is None:
        return wsgihelpers.forbidden(ctx)
    user.delete(safe = True)
    return wsgihelpers.redirect(ctx, location = urls.get_url(ctx, 'logout'))


@wsgihelpers.wsgify
def user_reset(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    current_test_case = user.current_test_case
    if current_test_case is not None:
        current_test_case.api_data = None
        current_test_case.save(safe = True)
    return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))


@wsgihelpers.wsgify
def user_view(req):
    ctx = contexts.Ctx(req)
    user = model.get_user(ctx, check = True)
    if user.email is None:
        return wsgihelpers.forbidden(ctx)
    return templates.render(ctx, '/accounts/user-view.mako', account = user)
