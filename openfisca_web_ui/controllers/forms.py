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

from .. import conf, contexts, conv, model, questions, templates, uuidhelpers, wsgihelpers


@wsgihelpers.wsgify
def form(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    user_api_data = session.user.api_data if session.user is not None else None
    if user_api_data is None:
        individu_id = uuidhelpers.generate_uuid()
        user_api_data = {
            u'familles': questions.familles.default_value(individu_ids = [individu_id]),
            u'individus': {individu_id: questions.individus.build_default_values()},
            }
    page_data = req.urlvars['page_data']
    if page_data['slug'] == 'familles':
        page_form = page_data['form_factory']()
    elif page_data['slug'] in ('declarations-impots', 'logements-principaux'):
        prenom_select_choices = questions.individus.build_prenom_select_choices(user_api_data)
        page_form = page_data['form_factory'](prenom_select_choices)
    else:
        legislation_urls_and_descriptions = (
            (legislation.get_api1_url(ctx, 'json'), legislation.title)
            for legislation in model.Legislation.find()
            )
        page_form = page_data['form_factory'](legislation_urls_and_descriptions)
    if req.method == 'GET':
        korma_values, korma_errors = pipe(
            page_data['api_data_to_page_korma_data'],
            page_form.root_data_to_str,
            )(user_api_data, state = ctx)
        page_form.fill(korma_values, korma_errors)
    else:
        params = req.params
        korma_inputs = variabledecode.variable_decode(params)
        korma_data, korma_errors = page_form.root_input_to_data(korma_inputs, state = ctx)
        if korma_errors is None:
            page_api_data = check(page_data['korma_data_to_page_api_data'](korma_data, state = ctx))
            if page_api_data is not None:
                user_api_data.update(page_api_data)
                session.user.api_data = user_api_data
                session.user.save(ctx, safe = True)
            return wsgihelpers.redirect(ctx, location = '')
        else:
            page_form.fill(korma_inputs, korma_errors)
    user_api_data['validate'] = True
    _, simulation_errors = conv.simulations.user_api_data_to_simulation_output(user_api_data, state = ctx)
    simulations = None if session.user.simulations is None else \
        list(model.Simulation.find({'_id': {'$in': session.user.simulations}}))
    if simulation_errors is not None:
        req.response.status = 400
    return templates.render_def(
        ctx,
        '/form.mako',
        'container_content',
        korma_errors = korma_errors or {},
        page_form = page_form,
        simulations = simulations,
        simulation_errors = simulation_errors or {},
        )
