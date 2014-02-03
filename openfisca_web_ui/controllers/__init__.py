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
import os

from formencode import variabledecode
from korma.group import Group

from .. import (
    contexts,
    conf,
    conv,
    matplotlib_helpers,
    model,
    pages,
    questions,
    templates,
    urls,
    uuidhelpers,
    wsgihelpers,
    )
from . import accounts, sessions, simulations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def all_questions(req):
    ctx = contexts.Ctx(req)
    ensure_session(ctx)
    session = ctx.session
    if model.column_by_name is None:
        model.init_api_columns_and_prestations()

    inputs = {
        'entity': req.params.get('entity') or None,
        'idx': req.params.get('idx') or None,
        }
    data, errors = conv.struct({
        'idx': conv.cleanup_line,
        'entity': conv.test_in(['fam', 'foy', 'ind', 'men']),
        })(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.redirect(ctx, location = '/famille')

    questions_list = model.questions_by_entity.get(data['entity'], []) if model.questions_by_entity is not None else []
    questions_list.append(questions.Hidden(name = 'idx', value=data['idx']))
    questions_list.append(questions.Hidden(name = 'entity', value=data['entity']))
    page_form = Group(
        children_attributes = {
            '_outer_html_template': u'<div class="form-group">{self.inner_html}</div>',
            },
        name = u'all_questions',
        questions = questions_list,
        )
    if req.method == 'GET':
        errors = None
        if session.user is not None and session.user.api_data is not None:
            page_form.fill({'all_questions': session.user.api_data.get('individus', {}).get(data['idx'], {})})
    else:
        params = req.params
        from pprint import pprint
        pprint(params)
        korma_inputs = variabledecode.variable_decode(params)
        korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
        if errors is None:
            api_data_key_by_entity = {
                'fam': 'familles',
                'foy': 'foyers_fiscaux',
                'ind': 'individus',
                'men': 'menages',
                }
            if data['entity'] in api_data_key_by_entity:
                session.user.api_data.setdefault(
                    api_data_key_by_entity[data['entity']],
                    {},
                    ).setdefault(data['idx'], {}).update(korma_data.get('all_questions'))
            session.user.save(ctx, safe = True)
            return wsgihelpers.redirect(ctx, location = '/famille')
    return templates.render(
        ctx,
        '/all-questions.mako',
        errors = errors or {},
        page_form = page_form,
        )


def ensure_session(ctx):
    session = ctx.session
    if session is None:
        session = ctx.session = model.Session()
        session.token = uuidhelpers.generate_uuid()
    if session.user is None:
        user = model.Account()
        user._id = uuidhelpers.generate_uuid()
        user.api_key = uuidhelpers.generate_uuid()
        user.compute_words()
        session.user_id = user._id
        user.save(ctx, safe = True)
        session.user = user
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
        if session.user is not None and session.user.api_data is not None:
            korma_data = conv.check(conv.api_data_to_korma_data(session.user.api_data, state = ctx))
            korma_values = conv.check(page_form.root_data_to_str(korma_data))
            page_form.fill(korma_values or {})
    else:
        params = req.params
        korma_inputs = variabledecode.variable_decode(params)
        korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
        page_form.fill(korma_data or {})
        if errors is None:
            korma_personnes = conv.check(page_data['korma_data_to_personnes'](korma_data, state = ctx))
            korma_entities = conv.check(page_data['korma_data_to_page_entities'](korma_data, state = ctx))
            api_data = conv.check(conv.korma_to_api(
                {
                    page_data['entities']: korma_entities,
                    'personnes': korma_personnes,
                    },
                state = ctx,
                ))
            session.user.api_data = api_data
            session.user.save(ctx, safe = True)
            return wsgihelpers.redirect(ctx, location = '')
    if session.user.api_data is None:
        session.user.api_data = {}
    session.user.api_data['validate'] = True
    simulation_output, errors = conv.pipe(
        conv.user_data_to_api_data,
        conv.api_data_to_simulation_output,
        )(session.user.api_data, state = ctx)
    return templates.render(
        ctx,
        '/form.mako',
        errors = errors or {},
        page_form = page_form,
        )


@wsgihelpers.wsgify
def image(req):
    ctx = contexts.Ctx(req)
    ensure_session(ctx)
    session = ctx.session
    if session.user.korma_data is None:
        session.user.korma_data = {}
    simulation_output, errors = conv.pipe(
        conv.user_data_to_api_data,
        conv.api_data_to_simulation_output,
        )(session.user.api_data, state = ctx)
    if errors is None:
        params = {
            'name': req.urlvars.get('name'),
            }
        image_name = conv.check(conv.test_in(['bareme', 'waterfall'])(params['name']))
        trees = simulation_output['value']
        if image_name == 'waterfall':
            matplotlib_helpers.create_waterfall_png(trees, filename = u'waterfall_{}.png'.format(session.token))
        elif image_name == 'bareme':
            matplotlib_helpers.create_bareme_png(
                trees,
                simulation_output,
                filename = u'bareme_{}.png'.format(session.token),
                )
        image_filename = os.path.join(
            conf['static_files_dir'],
            '{}_{}.png'.format(image_name, session.token),
            )
        req.response.content_type = 'image/jpeg'
        with open(image_filename, 'r') as img:
            req.response.write(img.read())
        return
    return wsgihelpers.no_content(ctx)


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    raise wsgihelpers.redirect(ctx, location = '/famille')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    routings = [
        ('GET', '^/?$', index),
        (('GET', 'POST'), '^/all-questions?$', all_questions),
        ('GET', '^/image/(?P<name>bareme|waterfall).png/?$', image),
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
