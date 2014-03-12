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


import babel.dates
import datetime

from biryani1.baseconv import check, pipe
from biryani1 import strings
from formencode import variabledecode

from .. import conf, contexts, conv, model, questions, templates, uuidhelpers, wsgihelpers


def get_user_api_data(ctx):
    session = ctx.session
    user_api_data = None
    if session is not None and session.user is not None:
        user_api_data = session.user.current_api_data
    if user_api_data is None:
        user_api_data = {}
    return user_api_data


@wsgihelpers.wsgify
def situation_form_get(req):
    ctx = contexts.Ctx(req)
    session = ctx.session

    if conf['cookie'] in req.cookies:
        session = update_session(session)
        if req.cookies.get(conf['cookie']) != session.token:
            req.response.set_cookie(
                conf['cookie'],
                session.token,
                httponly = True,
                secure = req.scheme == 'https',
                )

    user_api_data = get_user_api_data(ctx)
    filled_user_api_data = check(
        conv.base.make_fill_user_api_data(ensure_api_compliance = False)(user_api_data)
        )

    if model.fields_api_data() is None:
        return wsgihelpers.internal_error(ctx, explanation = ctx._(u'Unable to retrieve form fields.'))
    root_question = questions.base.make_situation_form(filled_user_api_data)
    values, errors = pipe(
        conv.base.api_data_to_korma_data,
        root_question.root_data_to_str,
        )(filled_user_api_data, state = ctx)
    root_question.fill(values, errors)

    return templates.render_def(ctx, '/forms.mako', 'situation_form', root_question = root_question,
                                user = session.user) \
        if req.is_xhr or req.params.get('xhr') \
        else templates.render(ctx, '/index.mako', root_question = root_question)


@wsgihelpers.wsgify
def situation_form_post(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        return wsgihelpers.unauthorized(ctx)
    assert session.user is not None

    user_api_data = get_user_api_data(ctx)
    if model.fields_api_data() is None:
        return wsgihelpers.internal_error(ctx, explanation = ctx._(u'Unable to retrieve form fields.'))
    root_question = questions.base.make_situation_form(user_api_data)
    inputs = variabledecode.variable_decode(req.params)
    data, errors = root_question.root_input_to_data(inputs, state = ctx)
    if errors is not None:
        root_question.fill(inputs, errors)
        if req.is_xhr:
            form_html = templates.render_def(ctx, '/forms.mako', 'situation_form', root_question = root_question,
                                             user = session.user)
            return wsgihelpers.respond_json(ctx, {'errors': errors, 'html': form_html})
        else:
            return templates.render(ctx, '/index.mako', root_question = root_question)
    api_data, errors = conv.base.korma_data_to_api_data(data, state = ctx)
    if errors is not None:
        root_question.fill(api_data, errors)
        if req.is_xhr:
            form_html = templates.render_def(ctx, '/forms.mako', 'situation_form', root_question = root_question,
                                             user = session.user)
            return wsgihelpers.respond_json(ctx, {'errors': errors, 'html': form_html})
        else:
            return templates.render(ctx, '/index.mako', root_question = root_question)
    if api_data is not None:
        user_api_data.update(api_data)
        current_test_case = session.user.current_test_case
        current_test_case.api_data = user_api_data
        current_test_case.save(safe = True)
    return wsgihelpers.respond_json(ctx, None) if req.is_xhr else wsgihelpers.redirect(ctx, location = '')


def update_session(session):
    if session is None:
        session = model.Session()
        session.anonymous_token = uuidhelpers.generate_uuid()
        session.token = uuidhelpers.generate_uuid()
    if session.user is None:
        user = model.Account()
        user._id = uuidhelpers.generate_uuid()
        user.compute_words()
        test_case_date = datetime.datetime.utcnow()
        test_case_title = u'Ma simulation du {}'.format(babel.dates.format_datetime(test_case_date))
        test_case = model.TestCase(
            author_id = user._id,
            title = test_case_title,
            slug = strings.slugify(test_case_title),
            )
        test_case.save(safe = True)
        user.current_test_case = test_case
        user.test_cases_id = [test_case._id]
        user.save(safe = True)
        session.user = user
    session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.save(safe = True)
    return session
