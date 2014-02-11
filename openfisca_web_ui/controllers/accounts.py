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
import uuid

from biryani1 import strings
import pymongo
import requests
import webob
import webob.multidict

from .. import conf, contexts, conv, model, paginations, templates, urls, uuidhelpers, wsgihelpers


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
inputs_to_account_data = conv.struct(
    dict(
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
def admin_delete(req):
    ctx = contexts.Ctx(req)
    account = ctx.node

    user = model.get_user(ctx)
    if user is None:
        return wsgihelpers.unauthorized(ctx,
            explanation = ctx._("Deletion unauthorized"),
            message = ctx._("You can not delete an account."),
            title = ctx._('Operation denied'),
            )
    if user._id != account._id and not user.admin:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("Deletion forbidden"),
            message = ctx._("You can not delete an account."),
            title = ctx._('Operation denied'),
            )

    if req.method == 'POST':
        if user._id != account._id:
            account.delete(ctx, safe = True)
            return wsgihelpers.redirect(ctx, location = model.Account.get_admin_class_url(ctx))
        else:
            account.delete(ctx, safe = True)
            return wsgihelpers.redirect(ctx, location = '/')
    return templates.render(ctx, '/accounts/admin-delete.mako', account = account)


@wsgihelpers.wsgify
def admin_edit(req):
    ctx = contexts.Ctx(req)
    account = ctx.node

    user = model.get_user(ctx)
    if user is None:
        return wsgihelpers.unauthorized(ctx,
            explanation = ctx._("Edition unauthorized"),
            message = ctx._("You can not edit an account."),
            title = ctx._('Operation denied'),
            )
    if user._id != account._id and not user.admin:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("Edition forbidden"),
            message = ctx._("You can not edit an account."),
            title = ctx._('Operation denied'),
            )

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
        if model.is_admin(ctx):
            data, errors = inputs_to_account_admin_data(inputs, state = ctx)
        else:
            data, errors = inputs_to_account_data(inputs, state = ctx)
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
                errors = dict(email = ctx._('An account with the same email already exists.'))
            if model.Account.find(
                    dict(
                        _id = {'$ne': account._id},
                        slug = data['slug'],
                        ),
                    as_class = collections.OrderedDict,
                    ).count() > 0:
                errors = dict(full_name = ctx._('An account with the same name already exists.'))
        if errors is None:
            account.set_attributes(**data)
            if account.api_key is None:
                account.api_key = uuidhelpers.generate_uuid()
            account.compute_words()
            account.save(ctx, safe = True)

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
                term = conv.input_to_words,
                ),
            ),
        conv.rename_item('page', 'page_number'),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.not_found(ctx, explanation = ctx._('Account search error: {}').format(errors))

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

    user = model.get_user(ctx, check = True)
    if user._id != account._id and not user.admin:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("View forbidden"),
            message = ctx._("You can not view an account."),
            title = ctx._('Operation denied'),
            )

    return templates.render(ctx, '/accounts/admin-view.mako', account = account)


@wsgihelpers.wsgify
def admin_reset(req):
    ctx = contexts.Ctx(req)
    account = ctx.node

    user = model.get_user(ctx)
    if user is None:
        return wsgihelpers.unauthorized(ctx,
            explanation = ctx._("Deletion unauthorized"),
            message = ctx._("You can not delete an account."),
            title = ctx._('Operation denied'),
            )
    if user._id != account._id and not user.admin:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("Reset forbidden"),
            message = ctx._("You can not reset an account."),
            title = ctx._('Operation denied'),
            )

    if user.api_data is not None:
        user.api_data = None
        user.save(ctx, safe = True)
    return wsgihelpers.redirect(ctx, location = '/')


@wsgihelpers.wsgify
def api1_delete(req):
    ctx = contexts.Ctx(req)
    headers = wsgihelpers.handle_cross_origin_resource_sharing(ctx)

    assert req.method == 'DELETE', req.method

    content_type = req.content_type
    if content_type is not None:
        content_type = content_type.split(';', 1)[0].strip()
    if content_type == 'application/json':
        inputs, error = conv.pipe(
            conv.make_input_to_json(),
            conv.test_isinstance(dict),
            )(req.body, state = ctx)
        if error is not None:
            return wsgihelpers.respond_json(ctx,
                collections.OrderedDict(sorted(dict(
                    apiVersion = '1.0',
                    error = collections.OrderedDict(sorted(dict(
                        code = 400,  # Bad Request
                        errors = [error],
                        message = ctx._(u'Invalid JSON in request DELETE body'),
                        ).iteritems())),
                    method = req.script_name,
                    params = req.body,
                    url = req.url.decode('utf-8'),
                    ).iteritems())),
                headers = headers,
                )
    else:
        # URL-encoded POST.
        inputs = dict(req.POST)

    data, errors = conv.struct(
        dict(
            # Shared secret between client and server
            api_key = conv.pipe(
                conv.test_isinstance(basestring),
                conv.base.input_to_uuid,
                conv.not_none,
                ),
            # For asynchronous calls
            context = conv.test_isinstance(basestring),
            ),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.respond_json(ctx,
            collections.OrderedDict(sorted(dict(
                apiVersion = '1.0',
                context = inputs.get('context'),
                error = collections.OrderedDict(sorted(dict(
                    code = 400,  # Bad Request
                    errors = [errors],
                    message = ctx._(u'Bad parameters in request'),
                    ).iteritems())),
                method = req.script_name,
                params = inputs,
                url = req.url.decode('utf-8'),
                ).iteritems())),
            headers = headers,
            )

    api_key = data['api_key']
    account = model.Account.find_one(
        dict(
            api_key = api_key,
            ),
        as_class = collections.OrderedDict,
        )
    if account is None:
        return wsgihelpers.respond_json(ctx,
            collections.OrderedDict(sorted(dict(
                apiVersion = '1.0',
                context = data['context'],
                error = collections.OrderedDict(sorted(dict(
                    code = 401,  # Unauthorized
                    message = ctx._('Unknown API Key: {}').format(api_key),
                    ).iteritems())),
                method = req.script_name,
                params = inputs,
                url = req.url.decode('utf-8'),
                ).iteritems())),
            headers = headers,
            )
    if not account.admin:
        return wsgihelpers.respond_json(ctx,
            collections.OrderedDict(sorted(dict(
                apiVersion = '1.0',
                context = data['context'],
                error = collections.OrderedDict(sorted(dict(
                    code = 403,  # Forbidden
                    message = ctx._('Non-admin API Key: {}').format(api_key),
                    ).iteritems())),
                method = req.script_name,
                params = inputs,
                url = req.url.decode('utf-8'),
                ).iteritems())),
            headers = headers,
            )

    deleted_value = conv.check(conv.method('turn_to_json'))(ctx.node, state = ctx)
    ctx.node.delete(ctx, safe = True)

    return wsgihelpers.respond_json(ctx,
        collections.OrderedDict(sorted(dict(
            apiVersion = '1.0',
            context = data['context'],
            method = req.script_name,
            params = inputs,
            url = req.url.decode('utf-8'),
            value = deleted_value,
            ).iteritems())),
        headers = headers,
        )


@wsgihelpers.wsgify
def api1_get(req):
    ctx = contexts.Ctx(req)
    headers = wsgihelpers.handle_cross_origin_resource_sharing(ctx)

    assert req.method == 'GET', req.method
    params = req.GET
    inputs = dict(
        callback = params.get('callback'),
        context = params.get('context'),
        )
    data, errors = conv.pipe(
        conv.struct(
            dict(
                callback = conv.pipe(
                    conv.test_isinstance(basestring),
                    conv.cleanup_line,
                    ),
                context = conv.test_isinstance(basestring),
                ),
            ),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.respond_json(ctx,
            dict(
                apiVersion = '1.0',
                context = inputs['context'],
                error = dict(
                    code = 400,  # Bad Request
                    errors = [
                        dict(
                            location = key,
                            message = error,
                            )
                        for key, error in sorted(errors.iteritems())
                        ],
                    # message will be automatically defined.
                    ),
                method = req.script_name,
                params = inputs,
                url = req.url.decode('utf-8'),
                ),
            headers = headers,
            jsonp = inputs['callback'],
            )

    return wsgihelpers.respond_json(ctx,
        collections.OrderedDict(sorted(dict(
            apiVersion = '1.0',
            context = data['context'],
            method = req.script_name,
            params = inputs,
            url = req.url.decode('utf-8'),
            value = conv.check(conv.method('turn_to_json'))(ctx.node, state = ctx),
            ).iteritems())),
        headers = headers,
        jsonp = data['callback'],
        )


@wsgihelpers.wsgify
def api1_index(req):
    ctx = contexts.Ctx(req)
    headers = wsgihelpers.handle_cross_origin_resource_sharing(ctx)

    assert req.method == 'GET', req.method
    params = req.GET
    inputs = dict(
        callback = params.get('callback'),
        context = params.get('context'),
        )
    data, errors = conv.pipe(
        conv.struct(
            dict(
                callback = conv.pipe(
                    conv.test_isinstance(basestring),
                    conv.cleanup_line,
                    ),
                context = conv.test_isinstance(basestring),
                ),
            ),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.respond_json(ctx,
            dict(
                apiVersion = '1.0',
                context = inputs['context'],
                error = dict(
                    code = 400,  # Bad Request
                    errors = [
                        dict(
                            location = key,
                            message = error,
                            )
                        for key, error in sorted(errors.iteritems())
                        ],
                    # message will be automatically defined.
                    ),
                method = req.script_name,
                params = inputs,
                url = req.url.decode('utf-8'),
                ),
            headers = headers,
            jsonp = inputs['callback'],
            )

    cursor = model.Account.get_collection().find(None, [])
    return wsgihelpers.respond_json(ctx,
        collections.OrderedDict(sorted(dict(
            apiVersion = '1.0',
            context = data['context'],
            method = req.script_name,
            params = inputs,
            url = req.url.decode('utf-8'),
            value = [
                account_attributes['_id']
                for account_attributes in cursor
                ],
            ).iteritems())),
        headers = headers,
        jsonp = data['callback'],
        )


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
        return wsgihelpers.not_found(ctx, explanation = ctx._('Account search error: {}').format(errors))

    criteria = {}
    if data['q'] is not None:
        criteria['words'] = {'$all': [
            re.compile(u'^{}'.format(re.escape(word)))
            for word in data['q']
            ]}
    cursor = model.Account.get_collection().find(criteria, ['full_name'])
    return wsgihelpers.respond_json(ctx,
        [
            account_attributes['full_name']
            for account_attributes in cursor.limit(10)
            ],
        headers = headers,
        )


@wsgihelpers.wsgify
def email_delete(req):
    ctx = contexts.Ctx(req)
    account = ctx.node

    user = model.get_user(ctx)
    if user is None or user._id != account._id:
        return wsgihelpers.unauthorized(ctx,
            explanation = ctx._("Deletion unauthorized"),
            message = ctx._("You can not delete an account."),
            title = ctx._('Operation denied'),
            )
    account.email = None
    account.full_name = None
    account.slug = None
    account.compute_words()
    account.save(ctx, safe = True)
    return wsgihelpers.redirect(ctx, location = '/')


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
    if registered_account is None:
        if session is None:
            ctx.session = session = model.Session()
            session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
        user = session.user
        if user is None:
            user = model.Account()
            user._id = uuidhelpers.generate_uuid()
            user.api_key = uuidhelpers.generate_uuid()
        user.email = verification_data['email']
        user.full_name = verification_data['email']
        user.slug = strings.slugify(user.full_name)
        user.compute_words()
        user.save(ctx, safe = True)
        ctx.user = user
        session.user_id = user._id
        session.user = user
    else:
        session.user_id = registered_account._id
        session.user = registered_account
    session.token = uuidhelpers.generate_uuid()
    session.save(ctx, safe = True)

    req.response.set_cookie(conf['cookie'], session.token, httponly = True, secure = req.scheme == 'https')
    return wsgihelpers.respond_json(
        ctx,
        dict(
            existingAccount = registered_account is not None,
            rejectUrl = session.user.get_admin_url(ctx, 'reject-cnil'),
            )
        )


@wsgihelpers.wsgify
def logout(req):
    ctx = contexts.Ctx(req)
    assert req.method == 'POST'
    session = ctx.session
    if session is not None:
        session.delete(ctx, safe = True)
        ctx.session = None
        if req.cookies.get(conf['cookie']) is not None:
            req.response.delete_cookie(conf['cookie'])
    return 'Logout succeeded.'


def route_admin(environ, start_response):
    req = webob.Request(environ)
    ctx = contexts.Ctx(req)

    account, error = conv.pipe(
        conv.input_to_slug,
        conv.not_none,
        model.Account.make_id_or_slug_or_words_to_instance(),
        )(req.urlvars.get('id_or_slug_or_words'), state = ctx)
    if error is not None:
        return wsgihelpers.not_found(ctx, explanation = ctx._('Account Error: {}').format(error))(
            environ, start_response)

    ctx.node = account

    router = urls.make_router(
        ('GET', '^/?$', admin_view),
        (('GET', 'POST'), '^/delete/?$', admin_delete),
        (('GET', 'POST'), '^/edit/?$', admin_edit),
        ('POST', '^/reject-cnil/?$', email_delete),
        ('GET', '^/reset/?$', admin_reset),
        )
    return router(environ, start_response)


def route_admin_class(environ, start_response):
    router = urls.make_router(
        ('GET', '^/?$', admin_index),
        (None, '^/(?P<id_or_slug_or_words>[^/]+)(?=/|$)', route_admin),
        )
    return router(environ, start_response)


def route_api1(environ, start_response):
    req = webob.Request(environ)
    ctx = contexts.Ctx(req)

    account, error = conv.pipe(
        conv.input_to_slug,
        conv.not_none,
        model.Account.make_id_or_slug_or_words_to_instance(),
        )(req.urlvars.get('id_or_slug_or_words'), state = ctx)
    if error is not None:
        params = req.GET
        return wsgihelpers.respond_json(ctx,
            collections.OrderedDict(sorted(dict(
                apiVersion = '1.0',
                context = params.get('context'),
                error = collections.OrderedDict(sorted(dict(
                    code = 404,  # Not Found
                    message = ctx._('Account Error: {}').format(error),
                    ).iteritems())),
                method = req.script_name,
                url = req.url.decode('utf-8'),
                ).iteritems())),
            )(environ, start_response)

    ctx.node = account

    router = urls.make_router(
        ('DELETE', '^/?$', api1_delete),
        ('GET', '^/?$', api1_get),
        )
    return router(environ, start_response)


def route_api1_class(environ, start_response):
    router = urls.make_router(
        ('GET', '^/?$', api1_index),
        ('GET', '^/typeahead/?$', api1_typeahead),
        (None, '^/(?P<id_or_slug_or_words>[^/]+)(?=/|$)', route_api1),
        )
    return router(environ, start_response)
