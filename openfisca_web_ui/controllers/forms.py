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


from biryani1.baseconv import check, pipe
from formencode import variabledecode

from .. import contexts, model, questions, templates, uuidhelpers, wsgihelpers


def build_page_form(ctx, page_data, user_api_data):
    form_factory = page_data['form_factory']
    page_slug = page_data['slug']
    if page_slug == 'familles':
        page_form = form_factory()
    elif page_slug in ('declarations-impots', 'logements-principaux'):
        prenom_select_choices = questions.individus.build_prenom_select_choices(user_api_data)
        page_form = form_factory(prenom_select_choices)
    else:
        assert page_slug == 'advanced', page_slug
        simulations_id_and_name = (
            (simulation._id, simulation.title)
            for simulation in ctx.session.user.simulations
            )
        legislations_id_and_name = (
            (legislation._id, legislation.title)
            for legislation in model.Legislation.find()
            )
        page_form = form_factory(simulations_id_and_name, legislations_id_and_name)
    return page_form


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
    user_api_data = None
    user_scenarios = None
    if session is not None and session.user is not None:
        user_api_data = session.user.current_api_data
        user_scenarios = session.user.scenarios
    if user_api_data is None:
        user_api_data = generate_default_user_api_data()
    page_data = req.urlvars['page_data']
    page_form = build_page_form(ctx, page_data, user_api_data)
    korma_values, korma_errors = build_page_korma_values(ctx, page_data, page_form, user_api_data, user_scenarios)
    page_form.fill(korma_values, korma_errors)
    return templates.render_def(ctx, '/form.mako', 'form', page_form = page_form)


@wsgihelpers.wsgify
def post(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    assert session.user is not None
    user_api_data = session.user.current_api_data
    user_scenarios = session.user.scenarios
    if user_api_data is None:
        user_api_data = {}
    page_data = req.urlvars['page_data']
    page_form = build_page_form(ctx, page_data, user_api_data)
    korma_inputs = variabledecode.variable_decode(req.params)
    korma_data, korma_errors = page_form.root_input_to_data(korma_inputs, state = ctx)
    if korma_errors is None:
        page_api_data = check(page_data['korma_data_to_page_api_data'](korma_data, state = ctx))
        if page_api_data is not None:
            if page_data['slug'] in ('familles', 'declarations-impots', 'logements-principaux'):
                user_api_data.update(page_api_data)
                current_simulation = session.user.current_simulation
                current_simulation.api_data = user_api_data
                current_simulation.save(safe = True)
            else:
                session.user.scenarios = page_api_data
            session.user.save(safe = True)
        return wsgihelpers.no_content(ctx)
    else:
        page_form.fill(korma_inputs, korma_errors)
        return templates.render_def(ctx, '/form.mako', 'form', page_form = page_form)
