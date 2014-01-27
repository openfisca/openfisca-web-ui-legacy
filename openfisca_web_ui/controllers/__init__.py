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
import uuid

from formencode import variabledecode
from korma.group import Group

from .. import contexts, conf, conv, matplotlib_helpers, model, pages, questions, templates, urls, wsgihelpers
from . import accounts, sessions, simulations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def all_questions(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None or session.user is None:
        raise wsgihelpers.redirect(ctx, location = '/personne')

    inputs = {
        'entity': req.params.get('entity') or None,
        'idx': req.params.get('idx') or None,
        }
    data, errors = conv.struct({
        'idx': conv.anything_to_int,
        'entities': conv.test_in(['fam', 'foy', 'ind', 'men']),
        })(inputs, state = ctx)
    group_questions = questions.openfisca_france_column_data_to_questions(keep_entity=data['entity'])
    page_form = Group(
        children_attributes = {
            '_inner_html_template': pages.bootstrap_control_inner_html_template,
            '_outer_html_template': pages.bootstrap_group_outer_html_template,
            },
        name = u'all_questions',
        questions = group_questions,
        )

    if session.user.korma_data is None:
        session.user.korma_data = {}
    if data['entity'] == 'fam':
        user_data = session.user.korma_data['famille']['famille_repeat'][data['idx']]['famille']
    elif data['entity'] == 'foy':
        user_data = session.user.korma_data['declaration_impot']['declaration_impot_repeat'][data['idx']][
            'declaration_impot']
    elif data['entity'] == 'ind':
        user_data = session.user.korma_data['personne']['personnes'][data['idx']]['person_data']

    if req.method == 'GET':
        if session is not None and session.user is not None:
            page_form.fill(user_data)
        return templates.render(
            ctx,
            '/all-questions.mako',
            page_form = page_form,
            )

    params = req.params
    korma_inputs = variabledecode.variable_decode(params)
    page_form.fill(user_data)
    korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/all-questions.mako',
            errors = errors,
            page_form = page_form,
            )
    user_data.update(korma_data['all_questions'])
    session.user.save(ctx, safe = True)
    api_data, errors = conv.korma_data_to_api_data(session.user.korma_data, state = ctx)
    if errors is not None:
        return templates.render(ctx, '/index.mako', errors = errors)
    simulation, errors = conv.api_data_to_simulation_output(api_data, state = ctx)
    if errors is not None:
        return templates.render(ctx, '/index.mako', errors = errors)
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    raise wsgihelpers.redirect(ctx, location = '/personne')


def ensure_session(ctx):
    session = ctx.session
    if session is None:
        session = ctx.session = model.Session()
        session.token = unicode(uuid.uuid4())
    if session.user is None:
        user = model.Account()
        user._id = unicode(uuid.uuid4())
        user.api_key = unicode(uuid.uuid4())
        user.compute_words()
        session.user_id = user._id
        user.save(ctx, safe = True)
    session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.save(ctx, safe = True)
    if ctx.req.cookies.get(conf['cookie']) != session.token:
        ctx.req.response.set_cookie(conf['cookie'], session.token, httponly = True)  # , secure = req.scheme == 'https')


@wsgihelpers.wsgify
def form(req):
    ctx = contexts.Ctx(req)
    ensure_session(ctx)
    session = ctx.session
    page_data = req.urlvars['page_data']
    page_form = pages.page_form(ctx, page_data['name'])
    if req.method == 'GET':
        errors = None
        if session.user.korma_data is not None:
            page_form.fill(session.user.korma_data.get(page_data['name'], {}))
    else:
        params = req.params
        korma_inputs = variabledecode.variable_decode(params)
        page_form.fill(korma_inputs)
        korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
        if errors is None:
            if session.user.korma_data is None:
                session.user.korma_data = {}
            session.user.korma_data.setdefault(page_data['name'], {}).update(korma_data)
            session.user.save(ctx, safe = True)
            simulation_output, errors = conv.pipe(
                conv.korma_data_to_api_data,
                conv.api_data_to_simulation_output,
                )(session.user.korma_data, state = ctx)
            if errors is None:
                trees = simulation_output['value']
                matplotlib_helpers.create_waterfall_png(trees, filename = u'waterfall_{}.png'.format(session.token))
#                matplotlib_helpers.create_bareme_png(
#                    trees,
#                    simulation_output,
#                    filename = u'bareme_{}.png'.format(session.token),
#                    )
                return wsgihelpers.redirect(ctx, location = '')
    return templates.render(
        ctx,
        '/{}.mako'.format(page_data['name']),
        errors = errors or {},
        page_form = page_form,
        )


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    raise wsgihelpers.redirect(ctx, location = '/famille')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    routings = [
        (('GET', 'POST'), '^/?$', index),
        (None, '^/admin/accounts(?=/|$)', accounts.route_admin_class),
        (None, '^/admin/sessions(?=/|$)', sessions.route_admin_class),
        (None, '^/admin/simulations(?=/|$)', simulations.route_admin_class),
        (None, '^/api/1/accounts(?=/|$)', accounts.route_api1_class),
        (None, '^/api/1/simulations(?=/|$)', simulations.route_api1_class),
        ('POST', '^/login/?$', accounts.login),
        ('POST', '^/logout/?$', accounts.logout),
        ]
    for page_data in pages.pages_data:
        routings.append(
            (('GET', 'POST'), '^/{slug}/?$'.format(slug=page_data['slug']), form, {'page_data': page_data})
            )
    router = urls.make_router(*routings)
    return router
