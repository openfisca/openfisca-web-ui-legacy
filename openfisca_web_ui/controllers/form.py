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


from formencode import variabledecode
from korma.group import Group

from .. import auth, contexts, conv, model, questions, templates, wsgihelpers


@wsgihelpers.wsgify
def all_questions(req):
    ctx = contexts.Ctx(req)
    auth.ensure_session(ctx)
    session = ctx.session
    id_, error = conv.base.input_to_uuid(req.urlvars['id'])
    if error is not None:
        return wsgihelpers.bad_request(ctx, explanation = error)
    page_data = req.urlvars['page_data']
    entity = page_data['entity']
    entity_questions = model.entity_questions(entity)
    if not entity_questions:
        return wsgihelpers.not_found(ctx, explanation = ctx._('No question'))
    entity_questions.extend([
        questions.Hidden(name = u'entity', value = entity),
        questions.Hidden(name = u'id', value = id_),
        ])
    page_form = Group(
        children_attributes = {
            '_outer_html_template': u'<div class="form-group">{self.inner_html}</div>',
            },
        name = u'questions',
        questions = entity_questions,
        )
    if req.method == 'GET':
        errors = None
        if session.user is not None and session.user.api_data is not None:
            page_form.fill({'questions': session.user.api_data.get(entity, {}).get(id_, {})})
    else:
        params = req.params
        korma_inputs = variabledecode.variable_decode(params)
        korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
        if errors is None:
            session.user.api_data.setdefault(entity, {}).setdefault(id_, {}).update({
                key: value
                for key, value in korma_data.get('questions').iteritems()
                # TODO remove these 2 keys in POST converter
                if key not in (u'entity', u'id')
                })
            session.user.save(ctx, safe = True)
            # TODO change redirect location according to coming page
            return wsgihelpers.redirect(ctx, location = '/famille')
    return templates.render(
        ctx,
        # TODO use template with tabs
        '/all-questions.mako',
        errors = errors or {},
        page_form = page_form,
        )


@wsgihelpers.wsgify
def form(req):
    ctx = contexts.Ctx(req)
    auth.ensure_session(ctx)
    session = ctx.session
    page_data = req.urlvars['page_data']
    page_form = None
    if page_data['slug'] in ['famille', 'declaration-impots', 'logement-principal']:
        prenom_select_choices = questions.individus.build_prenom_select_choices(ctx)
        page_form = page_data['form_factory'](prenom_select_choices)
    else:
        legislation_urls_and_descriptions = (
            (legislation.get_api1_url(ctx, 'json'), legislation.title)
            for legislation in model.Legislation.find()
            )
        page_form = page_data['form_factory'](legislation_urls_and_descriptions)
    if req.method == 'GET':
        korma_errors = None
        simulation_errors = None
        if session.user is not None and session.user.api_data is not None:
            korma_data = conv.check(conv.api.user_api_data_to_korma_data(session.user.api_data, state = ctx))
            korma_values = conv.check(page_form.root_data_to_str(korma_data))
            page_form.fill(korma_values or {})
    else:
        params = req.params
        from pprint import pprint
        korma_inputs = variabledecode.variable_decode(params)
        print '#' * 88, 'korma_inputs'
        pprint(korma_inputs)
        korma_data, korma_errors = page_form.root_input_to_data(korma_inputs, state = ctx)
        print '#' * 88, 'korma_data'
        pprint(korma_data)
        page_form.fill(korma_data or {}, korma_errors)
        if korma_errors is None:
            api_personnes = conv.check(page_data['korma_data_to_api_personnes'](korma_data, state = ctx))
            print '#' * 88, 'api_personnes'
            pprint(api_personnes)
            api_page_entities = conv.check(page_data['korma_data_to_api_page_entities'](korma_data, state = ctx))
            print '#' * 88, 'api_page_entities'
            pprint(api_page_entities)
            api_data = conv.check(conv.api_page_entities_and_personnes_to_api_data({
                page_data['entity']: api_page_entities,
                'personnes': api_personnes,
                }, state = ctx))
            session.user.api_data = api_data
            session.user.save(ctx, safe = True)
            return wsgihelpers.redirect(ctx, location = '')
    if session.user.api_data is None:
        session.user.api_data = {}
    session.user.api_data['validate'] = True
    simulation_output, simulation_errors = conv.simulation.user_api_data_to_simulation_output(
        session.user.api_data, state = ctx)
    return templates.render(
        ctx,
        '/form.mako',
        korma_errors = korma_errors or {},
        page_form = page_form,
        simulation_errors = simulation_errors or {},
        )
