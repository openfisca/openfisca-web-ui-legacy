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


"""Root controllers"""


import datetime
import logging

from biryani1.baseconv import check, pipe

from .. import contexts, conf, conv, model, templates, urls, uuidhelpers, wsgihelpers
from . import accounts, forms, legislations, sessions, test_cases, visualizations


email_log = logging.getLogger('email')
router = None


@wsgihelpers.wsgify
def accept_cookies(req):
    ctx = contexts.Ctx(req)
    if not ('accept' in req.params and check(conv.guess_bool(req.params.get('accept-checkbox'))) is True):
        # User doesn't accept the use of cookies => Bye bye.
        return wsgihelpers.redirect(ctx, location = conf['www.url'])
    session = ctx.session
    if session is None:
        session = ctx.session = model.Session()
        session.anonymous_token = uuidhelpers.generate_uuid()
        session.token = uuidhelpers.generate_uuid()
    session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.save(safe = True)
    response = wsgihelpers.redirect(ctx, location = urls.get_url(ctx))
    if ctx.req.cookies.get(conf['cookie']) != session.token:
        response.set_cookie(
            conf['cookie'],
            session.token,
            httponly = True,
            secure = ctx.req.scheme == 'https',
            )
    return response


@wsgihelpers.wsgify
def disclaimer_closed(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    session.disclaimer_closed = True
    session.save(safe = True)
    return wsgihelpers.no_content(ctx)


def get_api_data_and_errors(ctx, anonymous_token = None):
    if anonymous_token is None:
        session = ctx.session
    else:
        session = model.Session.find_one({'anonymous_token': anonymous_token})

    user_api_data = session.user.current_api_data if session is not None and session.user is not None else None
    if user_api_data is None:
        user_api_data = {}
    api_data, errors = pipe(
        conv.base.make_fill_user_api_data(ensure_api_compliance = True),
        conv.simulations.user_api_data_to_api_data,
        )(user_api_data, state = ctx)
    return api_data, errors


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    routings = [
        ('GET', '^/?$', forms.situation_form_get),
        ('POST', '^/?$', forms.situation_form_post),
        ('POST', '^/accept-cookies/?$', accept_cookies),
        (None, '^/account(?=/|$)', accounts.route_user),
        (None, '^/admin/accounts(?=/|$)', accounts.route_admin_class),
        (None, '^/admin/legislations(?=/|$)', legislations.route_admin_class),
        (None, '^/admin/sessions(?=/|$)', sessions.route_admin_class),
        (None, '^/admin/visualizations(?=/|$)', visualizations.route_admin_class),
        (None, '^/api/1/disclaimer_closed$', disclaimer_closed),
        (None, '^/api/1/legislations(?=/|$)', legislations.route_api1_class),
        (None, '^/api/1/session$', session),
        (None, '^/api/1/simulate/?$', simulate),
        (None, '^/api/1/visualizations(?=/|$)', visualizations.route_api1_class),
        (None, '^/legislations(?=/|$)', legislations.route_user_class),
        (None, '^/simulations(?=/|$)', test_cases.route),
        # TODO use route_user_class
        (None, '^/visualizations(?=/|$)', visualizations.route_user),
        ('POST', '^/login/?$', accounts.login),
        (('GET', 'POST'), '^/logout/?$', accounts.logout),
        ('GET', '^/terms/?$', terms),
        ]
    router = urls.make_router(*routings)
    return router


@wsgihelpers.wsgify
def session(req):
    ctx = contexts.Ctx(req)
    api_data, errors = get_api_data_and_errors(ctx)
    data = api_data if errors is None else {'errors': errors}
    return wsgihelpers.respond_json(ctx, data)


@wsgihelpers.wsgify
def simulate(req):
    ctx = contexts.Ctx(req)
    headers = wsgihelpers.handle_cross_origin_resource_sharing(ctx)
    params = req.params
    inputs = dict(
        axes = params.get('axes'),
        decomposition = params.get('decomposition'),
        token = params.get('token'),
        )
    data, errors = conv.struct({
        'axes': conv.pipe(
            conv.make_input_to_json(),
            conv.uniform_sequence(
                conv.struct({
                    'count': conv.test_greater_or_equal(1),
                    'min': conv.test_isinstance(int),
                    'max': conv.test_isinstance(int),
                    'name': conv.cleanup_line,
                    }),
                ),
            ),
        'decomposition': conv.first_match(
            conv.make_input_to_json(),
            conv.cleanup_line,
            ),
        'token': conv.base.input_to_uuid,
        })(inputs, state = ctx)
    if errors is None:
        api_data, errors = get_api_data_and_errors(ctx, anonymous_token = data['token'])
    if errors is None:
        if data['axes'] is not None:
            for scenario in api_data['scenarios']:
                scenario['axes'] = data['axes']
        api_data['decomposition'] = data['decomposition']
        output, errors = conv.simulations.api_data_to_simulation_output(api_data, state = ctx)
        if errors is not None:
            email_log.error(u'Simulation error returned by API:\napi_data = {}\nerrors = {}'.format(api_data, errors))
        output_data = {'output': output, 'errors': errors}
    else:
        output_data = {'errors': errors}
    if data['token'] is not None and 'params' in output_data.get('output', {}):
        # Call with token are anonymous. Remove params from json response
        del output_data['output']['params']
    return wsgihelpers.respond_json(ctx, output_data, headers = headers)


@wsgihelpers.wsgify
def terms(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/terms.mako')
