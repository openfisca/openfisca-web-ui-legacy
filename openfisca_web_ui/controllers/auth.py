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


"""Controllers for authentication"""


import collections
import datetime
import json

from biryani1 import strings
import requests

from .. import conf, contexts, conv, model, templates, urls, uuidhelpers, wsgihelpers


@wsgihelpers.wsgify
def become_admin(req):
    """Fake admin login, used only in debug environment."""
    assert conf['debug']
    ctx = contexts.Ctx(req)
    admin_account = model.Account.find_one({'admin': True})
    if admin_account is None:
        admin_account = model.Account(
            admin = True,
            cnil_conditions_accepted = True,
            email = u'admin@domain.tld',
            )
        admin_account.save(safe = True)
    session = ctx.session
    if session is None:
        ctx.session = session = model.Session()
        session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.anonymous_token = uuidhelpers.generate_uuid()
    session.token = uuidhelpers.generate_uuid()
    session.user = admin_account
    session.save(safe = True)
    req.response.set_cookie(conf['cookie'], session.token, httponly = True, secure = req.scheme == 'https')
    location = req.params.get('redirect') or admin_account.get_user_url(ctx)
    return wsgihelpers.redirect(ctx, location = location)


@wsgihelpers.wsgify
def become_user(req):
    """Fake user login, used only in debug environment."""
    assert conf['debug']
    ctx = contexts.Ctx(req)
    user_accounts = [account for account in model.Account.find({'email': {'$exists': True}}) if not account.admin]
    if user_accounts:
        user_account = user_accounts[0]
    else:
        user_account = model.Account(
            cnil_conditions_accepted = True,
            email = u'user@domain.tld',
            )
        user_account.save(safe = True)
    session = ctx.session
    if session is None:
        ctx.session = session = model.Session()
        session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.anonymous_token = uuidhelpers.generate_uuid()
    session.token = uuidhelpers.generate_uuid()
    session.user = user_account
    session.save(safe = True)
    req.response.set_cookie(conf['cookie'], session.token, httponly = True, secure = req.scheme == 'https')
    location = req.params.get('redirect') or user_account.get_user_url(ctx)
    return wsgihelpers.redirect(ctx, location = location)


@wsgihelpers.wsgify
def login(req):
    """Authorization request."""
    ctx = contexts.Ctx(req)

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
            user.api_key = uuidhelpers.generate_uuid()
        user.email = verification_data['email']
        user.full_name = verification_data['email']
        user.slug = strings.slugify(user.full_name)
        user.compute_words()
        user.save(safe = True)
        session.user = user
    else:
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
