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


"""Form controllers"""


import datetime

from biryani1.baseconv import check, pipe
from biryani1 import strings
from formencode import variabledecode

from .. import conf, contexts, conv, model, questions, templates, uuidhelpers, wsgihelpers


#def build_page_form(ctx, page_data, user_api_data):
#    form_factory = page_data['form_factory']
#    page_slug = page_data['slug']
#    if page_slug == 'familles':
#        page_form = form_factory()
#    elif page_slug in ('declarations-impots', 'logements-principaux'):
#        prenom_select_choices = questions.individus.build_prenom_select_choices(user_api_data)
#        page_form = form_factory(prenom_select_choices)
#    else:
#        assert page_slug == 'advanced', page_slug
#        simulations_id_and_name = (
#            (simulation._id, simulation.title)
#            for simulation in ctx.session.user.simulations
#            )
#        legislations_id_and_name = (
#            (legislation._id, legislation.title)
#            for legislation in model.Legislation.find()
#            )
#        page_form = form_factory(simulations_id_and_name, legislations_id_and_name)
#    return page_form


def build_page_korma_values(ctx, page_data, page_form, user_api_data = None, user_scenarios = None):
    page_slug = page_data['slug']
    if page_slug in ('familles', 'declarations-impots', 'logements-principaux'):
        return pipe(
            page_data['api_data_to_page_korma_data'],
            page_form.root_data_to_str,
            )(user_api_data, state = ctx)
    else:
        assert page_slug == 'advanced', page_slug
        return pipe(
            page_data['scenarios_to_page_korma_data'],
            page_form.root_data_to_str,
            )(user_scenarios, state = ctx)


def generate_default_user_api_data():
    individu_id = uuidhelpers.generate_uuid()
    user_api_data = {
        u'familles': questions.familles.default_value(individu_ids = [individu_id]),
        u'individus': {individu_id: questions.individus.build_default_values()},
        }
    return user_api_data


@wsgihelpers.wsgify
def get(req):
    ctx = contexts.Ctx(req)
    session = ctx.session

    if conf['cookie'] in req.cookies:
        session = update_session(session)
        if ctx.req.cookies.get(conf['cookie']) != session.token:
            ctx.req.response.set_cookie(
                conf['cookie'],
                session.token,
                httponly = True,
                secure = ctx.req.scheme == 'https',
                )

    user_api_data = None
#    user_scenarios = None
    if session is not None and session.user is not None:
        user_api_data = session.user.current_api_data
#        user_scenarios = session.user.scenarios
    if user_api_data is None:
        user_api_data = generate_default_user_api_data()

#    page_form = build_page_form(ctx, page_data, user_api_data)
#    korma_values, korma_errors = build_page_korma_values(ctx, page_data, page_form, user_api_data, user_scenarios)

    root_question = questions.base.make_situation_form(user_api_data)
    values, errors = pipe(
        conv.base.api_data_to_korma_data,
        root_question.data_to_str,
        )(user_api_data, state = ctx)
    root_question.value = values
    root_question.error = errors

    return templates.render_def(ctx, '/form.mako', 'form', root_question = root_question, user = session.user) \
        if req.is_xhr or req.params.get('xhr') \
        else templates.render(ctx, '/index.mako', root_question = root_question)


@wsgihelpers.wsgify
def post(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    assert session.user is not None

    user_api_data = session.user.current_api_data
    if user_api_data is None:
        user_api_data = {}

#    page_form = build_page_form(ctx, page_data, user_api_data)
#    korma_inputs = variabledecode.variable_decode(req.params)
#    korma_data, korma_errors = page_form.root_input_to_data(korma_inputs, state = ctx)
#    if korma_errors is None:
#        page_api_data = check(page_data['korma_data_to_page_api_data'](korma_data, state = ctx))
#        if page_api_data is not None:
#            if page_data['slug'] in ('familles', 'declarations-impots', 'logements-principaux'):
#                user_api_data.update(page_api_data)
#                current_simulation = session.user.current_simulation
#                current_simulation.api_data = user_api_data
#                current_simulation.save(safe = True)
#            else:
#                session.user.scenarios = page_api_data

    root_question = questions.base.make_situation_form(user_api_data)
    inputs = variabledecode.variable_decode(req.params)
    data, errors = root_question.root_input_to_data(inputs, state = ctx)
    if errors is not None:
        if req.is_xhr:
            return wsgihelpers.respond_json(ctx, {'errors': errors})
        else:
            root_question.fill(inputs, errors)
            return templates.render(ctx, '/index.mako', root_question = root_question)
    api_data = check(conv.base.korma_data_to_api_data(data, state = ctx))
    if api_data is not None:
        user_api_data.update(api_data)
        current_simulation = session.user.current_simulation
        current_simulation.api_data = user_api_data
        current_simulation.save(safe = True)
    if req.is_xhr:
        return wsgihelpers.respond_json(ctx, None)
    else:
        return wsgihelpers.redirect(ctx, location = '')


def update_session(session):
    if session is None:
        session = model.Session()
        session.token = uuidhelpers.generate_uuid()
    if session.user is None:
        user = model.Account()
        user._id = uuidhelpers.generate_uuid()
        user.compute_words()
        simulation_date = datetime.datetime.utcnow()
        simulation_title = u'Ma simulation du {} à {}'.format(
            datetime.datetime.strftime(simulation_date, u'%d/%m/%Y'),
            datetime.datetime.strftime(simulation_date, u'%H:%M'),
            )
        simulation = model.Simulation(
            author_id = user._id,
            title = simulation_title,
            slug = strings.slugify(simulation_title),
            )
        simulation.save(safe = True)
        user.current_simulation = simulation
        user.simulations_id = [simulation._id]
        user.save(safe = True)
        session.user = user
    session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.save(safe = True)
    return session
