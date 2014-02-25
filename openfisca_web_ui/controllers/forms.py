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


def generate_default_user_api_data():
    individu_id = uuidhelpers.generate_uuid()
    user_api_data = {
        u'familles': questions.familles.default_value(individu_ids = [individu_id]),
        u'individus': {individu_id: questions.individus.build_default_values()},
        }
    return user_api_data


@wsgihelpers.wsgify
def situation_form_get(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    session = update_session(session)

    if conf['cookie'] in req.cookies:
        if req.cookies.get(conf['cookie']) != session.token:
            req.response.set_cookie(
                conf['cookie'],
                session.token,
                httponly = True,
                secure = req.scheme == 'https',
                )

    user_api_data = None
    settings_question = None
    if session is not None and session.user is not None:
        user_api_data = session.user.current_api_data
    if user_api_data is None:
        user_api_data = generate_default_user_api_data()
    if session.user is not None and session.user.email is not None:
        settings_question = questions.legislations.make_legislations_repeat(session.user)
        values, errors = pipe(
            conv.legislations.scenarios_to_page_korma_data,
            settings_question.root_data_to_str,
            )(session.user.scenarios, state = ctx)
        settings_question.fill(values, errors)

    root_question = questions.base.make_situation_form(user_api_data)
    values, errors = pipe(
        conv.base.api_data_to_korma_data,
        root_question.data_to_str,
        )(user_api_data, state = ctx)
    root_question.value = values
    root_question.error = errors

    return templates.render_def(ctx, '/forms.mako', 'form', root_question = root_question, user = session.user) \
        if req.is_xhr or req.params.get('xhr') \
        else templates.render(ctx, '/index.mako', root_question = root_question, settings_question = settings_question)


@wsgihelpers.wsgify
def situation_form_post(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    assert session.user is not None

    user_api_data = session.user.current_api_data
    if user_api_data is None:
        user_api_data = {}

    root_question = questions.base.make_situation_form(user_api_data)
    inputs = variabledecode.variable_decode(req.params)
    data, errors = root_question.root_input_to_data(inputs, state = ctx)
    if errors is not None:
        root_question.fill(inputs, errors)
        if req.is_xhr:
            form_html = templates.render_def(ctx, '/forms.mako', 'form', root_question = root_question,
                                             user = session.user)
            return wsgihelpers.respond_json(ctx, {'errors': errors, 'formHtml': form_html})
        else:
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
