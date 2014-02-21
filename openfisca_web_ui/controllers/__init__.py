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

from biryani1.baseconv import check
from formencode import variabledecode

from .. import contexts, conf, conv, model, templates, questions, urls, uuidhelpers, wsgihelpers
from . import accounts, forms, legislations, sessions, simulations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def accept_cookies(req):
    ctx = contexts.Ctx(req)
    assert req.method == 'POST'
    if not ('accept' in req.params and check(conv.guess_bool(req.params.get('accept-checkbox'))) is True):
        # User doesn't accept the use of cookies => Bye bye.
        return wsgihelpers.redirect(ctx, location = conf['www.url'])
    session = ctx.session
    if session is None:
        session = ctx.session = model.Session()
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


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    routings = [
        ('GET', '^/?$', forms.get),
        ('POST', '^/?$', forms.post),
        (('GET', 'POST'), '^/accept-cookies/?$', accept_cookies),
        (None, '^/accounts(?=/|$)', accounts.route_user),
        (None, '^/admin/accounts(?=/|$)', accounts.route_admin_class),
        (None, '^/admin/legislations(?=/|$)', legislations.route_admin_class),
        (None, '^/admin/sessions(?=/|$)', sessions.route_admin_class),
        (None, '^/api/1/accounts(?=/|$)', accounts.route_api1_class),
        (None, '^/api/1/legislations(?=/|$)', legislations.route_api1_class),
        (None, '^/api/1/simulate$', simulate),
        (None, '^/legislations(?=/|$)', legislations.route_user),
        (None, '^/simulations(?=/|$)', simulations.route),
        ('POST', '^/login/?$', accounts.login),
        (('GET', 'POST'), '^/logout/?$', accounts.logout),
        ('POST', '^/scenarios/?$', settings),
        ('GET', '^/terms/?$', terms),
        ]
    router = urls.make_router(*routings)
    return router


@wsgihelpers.wsgify
def settings(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    assert session.user is not None

    settings_question = questions.legislations.make_legislations_repeat(session.user)
    inputs = variabledecode.variable_decode(req.params)
    data, errors = settings_question.root_input_to_data(inputs, state = ctx)
    if errors is not None:
        if req.is_xhr:
            return wsgihelpers.respond_json(ctx, {'errors': errors})
        else:
            settings_question.fill(inputs, errors)
            return templates.render(
                ctx,
                '/index.mako',
                root_question = questions.base.make_situation_form(session.user.current_api_data or {}),
                settings_question = settings_question,
                )
    scenarios = check(conv.legislations.korma_data_to_scenarios(data, state = ctx))
    if scenarios is not None:
        session.user.scenarios = scenarios
        session.user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))


@wsgihelpers.wsgify
def simulate(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    user_scenarios = session.user.scenarios if session is not None and session.user is not None else None
    if user_scenarios is None:
        user_api_data = session.user.current_api_data if session is not None and session.user is not None else None
        if user_api_data is None:
            user_api_data = {}
        api_data = check(conv.simulations.user_api_data_to_api_data(user_api_data, state = ctx))
    else:
        api_data = check(conv.simulations.scenarios_to_api_data(user_scenarios, state = ctx))
    output, errors = conv.simulations.api_data_to_simulation_output(api_data, state = ctx)
    if errors is not None:
        log.error(u'Simulation error returned by API:\napi_data = {}\nerrors = {}'.format(api_data, errors))
    data = {'output': output, 'errors': errors}
    return wsgihelpers.respond_json(ctx, data)


@wsgihelpers.wsgify
def terms(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/terms.mako')
