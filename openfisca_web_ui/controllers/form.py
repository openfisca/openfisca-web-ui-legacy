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

from .. import auth, contexts, conv, model, pages, templates, wsgihelpers


@wsgihelpers.wsgify
def all_questions(req):
    ctx = contexts.Ctx(req)
    auth.ensure_session(ctx)
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
    page_form = Group(
        children_attributes = {
            '_outer_html_template': u'<div class="form-group">{self.inner_html}</div>',
            },
        outer_html_template = u'''
{{self.inner_html}}
<input name="entity" type="hidden" value="{data[entity]}">
<input name="idx" type="hidden" value="{data[idx]}">
'''.format(data=data),
        name = u'all_questions',
        questions = questions_list,
        )
    api_data_key_by_entity = {
        'fam': 'familles',
        'foy': 'foyers_fiscaux',
        'ind': 'individus',
        'men': 'menages',
        }
    if req.method == 'GET':
        errors = None
        if session.user is not None and session.user.api_data is not None:
            page_form.fill({'all_questions': session.user.api_data.get(api_data_key_by_entity[data['entity']], {}).get(
                data['idx'], {})})
    else:
        params = req.params
        korma_inputs = variabledecode.variable_decode(params)
        korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
        if errors is None:
            if data['entity'] in api_data_key_by_entity:
                session.user.api_data.setdefault(
                    api_data_key_by_entity[data['entity']], {}).setdefault(data['idx'], {}).update({
                    key: value
                    for key, value in korma_data.get('all_questions').iteritems()
                    if key not in (u'entity', u'idx')
                    })
            session.user.save(ctx, safe = True)
            return wsgihelpers.redirect(ctx, location = '/famille')
    return templates.render(
        ctx,
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
    page_form = pages.page_form(ctx, page_data['name'])
    if req.method == 'GET':
        errors = None
        if session.user is not None and session.user.api_data is not None:
            korma_data = conv.check(
                conv.pipe(conv.complete_api_data, conv.api_data_to_korma_data)(session.user.api_data, state = ctx)
                )
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
    simulation_output, simulation_errors = conv.pipe(
        conv.complete_api_data,
        conv.user_data_to_api_data,
        conv.api_data_to_simulation_output,
        )(session.user.api_data, state = ctx)
    return templates.render(
        ctx,
        '/form.mako',
        errors = errors or {},
        simulation_errors = simulation_errors or {},
        page_form = page_form,
        )
