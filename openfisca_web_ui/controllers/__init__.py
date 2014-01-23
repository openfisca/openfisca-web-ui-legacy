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
from korma.choice import Select
from korma.group import Group
from korma.repeat import Repeat
from korma.text import Number, Text

from .. import contexts, conf, conv, matplotlib_helpers, model, questions, templates, urls, wsgihelpers
from . import accounts, sessions, simulations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def all_questions(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None or session.user is None:
        raise wsgihelpers.redirect(ctx, location = '/personne')

    inputs = {'entities': req.params.getall('entity') or None}
    group_questions = questions.openfisca_france_column_data_to_questions(keep_entities=inputs['entities'])
    page_form = Group(
        children_attributes = {
            'outer_html_template': u'<div class="form-group">{self.inner_html}</div>',
            'inner_html_template': u'''<label class="col-sm-2 control-label" for="{self.full_name}">{self.label}</label>
<div class="col-sm-10">{self.control_html}</div>''',
            },
        name=u'all_questions',
        questions=group_questions,
        )
    if req.method == 'GET':
        if session is not None and session.user is not None:
            page_form.fill(session.user.korma_data.get('all_questions', {}))
        return templates.render(
            ctx,
            '/all-questions.mako',
            page_form = page_form,
            )

    params = req.params
    korma_inputs = variabledecode.variable_decode(params)
    page_form.fill(korma_inputs)
    korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/all-questions.mako',
            errors = errors,
            page_form = page_form,
            )

    if session.user.korma_data is None:
        session.user.korma_data = {}
    session.user.korma_data.setdefault('all_questions', {}).update(korma_data)
    session.user.save(ctx, safe = True)

    raise wsgihelpers.redirect(ctx, location = '/personne')


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    return wsgihelpers.redirect(ctx, location = '/personne')


@wsgihelpers.wsgify
def declaration_impot(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None or session.user is None or session.user.korma_data.get('personne') is None:
        raise wsgihelpers.redirect(ctx, location = '/personne')

    persons_name = [person['person_data']['name'] for person in session.user.korma_data['personne']['personnes'] or []]
    page_form = Repeat(
        template_question = Group(
            children_attributes = {
                'outer_html_template': u'<div class="form-group">{self.inner_html}</div>',
                'inner_html_template': u'''
<label class="col-sm-2 control-label" for="{self.full_name}">{self.label}</label>
<div class="col-sm-10">{self.control_html}</div>''',
                },
            name = 'declaration_impot',
            questions = [
                Select(
                    control_attributes = {'class': 'form-control'},
                    choices = persons_name,
                    label = u'Vous',
                    ),
                Select(
                    control_attributes = {'class': 'form-control'},
                    choices = persons_name,
                    label = u'Conj',
                    ),
                Repeat(
                    template_question = Select(
                        control_attributes = {'class': 'form-control'},
                        choices = persons_name,
                        label = u'Personne à charge',
                        name = 'pac',
                        ),
                    ),
                ]
            ),
        )
    if req.method == 'GET':
        page_form.fill(session.user.korma_data.get('declaration_impot', {}))
        return templates.render(
            ctx,
            '/declaration-impot.mako',
            page_form = page_form,
            )

    params = req.params
    korma_inputs = variabledecode.variable_decode(params)
    page_form.fill(korma_inputs)
    korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/declaration-impot.mako',
            errors = errors,
            page_form = page_form,
            )

    if session.user.korma_data is None:
        session.user.korma_data = {}
    session.user.korma_data.setdefault('declaration_impot', {}).update(korma_data)
    session.user.save(ctx, safe = True)

    api_data, errors = conv.user_data_to_api_data(session.user.korma_data, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/declaration-impot.mako',
            api_data = api_data,
            errors = errors,
            page_form = page_form,
            )

    simulation, errors = conv.data_to_simulation(api_data, state = ctx)
    if errors is not None:
        # TODO(rsoufflet) Make a real 500 internal error
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'API Error: {0}').format(errors))
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    return wsgihelpers.redirect(ctx, location = '/famille')


@wsgihelpers.wsgify
def famille(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None or session.user is None or session.user.korma_data.get('personne') is None:
        raise wsgihelpers.redirect(ctx, location = '/personne')

    persons_name = [person['person_data']['name'] for person in session.user.korma_data['personne']['personnes'] or []]
    page_form = Repeat(
        template_question = Group(
            name = 'famille',
            questions = [
                Select(
                    choices = persons_name,
                    label = u'Parent1',
                    ),
                Select(
                    choices = persons_name,
                    label = u'Parent2',
                    ),
                Repeat(
                    template_question = Select(
                        choices = persons_name,
                        label = u'Enfant',
                        name = 'enf',
                        ),
                    ),
                ]
            ),
        )
    if req.method == 'GET':
        page_form.fill(session.user.korma_data.get('famille', {}))
        return templates.render(
            ctx,
            '/famille.mako',
            page_form = page_form,
            )

    params = req.params
    korma_inputs = variabledecode.variable_decode(params)
    page_form.fill(korma_inputs if korma_inputs.get('famille') else {})
    korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/famille.mako',
            errors = errors,
            page_form = page_form,
            )

    if session.user.korma_data is None:
        session.user.korma_data = {}
    session.user.korma_data.setdefault('famille', {}).update(korma_data)
    session.user.save(ctx, safe = True)

    api_data, errors = conv.user_data_to_api_data(session.user.korma_data, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/famille.mako',
            api_data = api_data,
            errors = errors,
            page_form = page_form,
            )

    simulation, errors = conv.data_to_simulation(api_data, state = ctx)
    if errors is not None:
        # TODO(rsoufflet) Make a real 500 internal error
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'API Error: {0}').format(errors))
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    return wsgihelpers.redirect(ctx, location = '/logement-principal')


@wsgihelpers.wsgify
def logement_principal(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        raise wsgihelpers.redirect(ctx, location = '/personne')

    page_form = Repeat(
        template_question = Group(
            name = 'logement_principal',
            questions = [
                Select(
                    first_unselected = True,
                    label = u'Statut d\'occupation',
                    name = u'so',
                    choices = [
                        u'Non renseigné',
                        u'Accédant à la propriété',
                        u'Propriétaire (non accédant) du logement',
                        u'Locataire d\'un logement HLM',
                        u'Locataire ou sous-locataire d\'un logement loué vide non-HLM',
                        u'Locataire ou sous-locataire d\'un logement loué meublé ou d\'une chambre d\'hôtel',
                        u'Logé gratuitement par des parents, des amis ou l\'employeur',
                        ]
                    ),
                Number(label = u'Loyer'),
                Text(label = u'Localité'),
                ]
            ),
        )
    if req.method == 'GET':
        page_form.fill(session.user.korma_data.get('logement_principal', {}))
        return templates.render(
            ctx,
            '/logement-principal.mako',
            page_form = page_form,
            )

    params = req.params
    korma_inputs = variabledecode.variable_decode(params)
    page_form.fill(korma_inputs)
    korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/famille.mako',
            errors = errors,
            page_form = page_form,
            )

    if session.user.korma_data is None:
        session.user.korma_data = {}
    session.user.korma_data.setdefault('logement_principal', {}).update(korma_data)
    session.user.save(ctx, safe = True)

    api_data, errors = conv.user_data_to_api_data(session.user.korma_data, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/famille.mako',
            api_data = api_data,
            errors = errors,
            page_form = page_form,
            )

    simulation, errors = conv.data_to_simulation(api_data, state = ctx)
    if errors is not None:
        # TODO(rsoufflet) Make a real 500 internal error
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'API Error: {0}').format(errors))
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    return wsgihelpers.redirect(ctx, location = '/logement-principal')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    router = urls.make_router(
        ('GET', '^/?$', index),
        (('GET', 'POST'), '^/personne/?$', personne),
        (('GET', 'POST'), '^/declaration-impot/?$', declaration_impot),
        (('GET', 'POST'), '^/famille/?$', famille),
        (('GET', 'POST'), '^/logement-principal/?$', logement_principal),
        (('GET', 'POST'), '^/all-questions/?$', all_questions),

        (None, '^/admin/accounts(?=/|$)', accounts.route_admin_class),
        (None, '^/admin/sessions(?=/|$)', sessions.route_admin_class),
        (None, '^/admin/simulations(?=/|$)', simulations.route_admin_class),
        (None, '^/api/1/accounts(?=/|$)', accounts.route_api1_class),
        (None, '^/api/1/simulations(?=/|$)', simulations.route_api1_class),
        ('POST', '^/login/?$', accounts.login),
        ('POST', '^/logout/?$', accounts.logout),
        )
    return router


@wsgihelpers.wsgify
def personne(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None:
        ctx.session = session = model.Session()
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

    if req.cookies.get(conf['cookie']) != session.token:
        req.response.set_cookie(conf['cookie'], session.token, httponly = True)  # , secure = req.scheme == 'https')

    page_form = Repeat(
        name = 'personnes',
        template_question = Group(
            children_attributes = {
                'outer_html_template': u'<div class="form-group">{self.inner_html}</div>',
                'inner_html_template': u'''
<label class="col-sm-2 control-label" for="{self.full_name}">{self.label}</label>
<div class="col-sm-10">
    {self.control_html}
</div>
''',
                },
            name = 'person_data',
            questions = [
                Text(
                    control_attributes = {'class': 'form-control'},
                    label = u'Nom',
                    name = 'name',
                    ),
                Number(
                    control_attributes = {'class': 'form-control'},
                    label = u'Salaire imposable annuel',
                    name = 'maxrev'),
                Select(
                    control_attributes = {'class': 'form-control'},
                    first_unselected = True,
                    label = u'Activité',
                    choices = [
                        u'Actif occupé',
                        u'Chômeur',
                        u'Étudiant, élève',
                        u'Retraité',
                        u'Autre inactif',
                        ]
                    ),
                questions.MongoDate(
                    control_attributes = {'class': 'form-control'},
                    label = u'Date de naissance',
                    name = 'birth'),
                Select(
                    control_attributes = {'class': 'form-control'},
                    first_unselected = True,
                    label = u'Statut marital',
                    choices = [
                        u'Marié',
                        u'Célibataire',
                        u'Divorcé',
                        u'Veuf',
                        u'Pacsé',
                        u'Jeune veuf',
                        ]
                    ),
                ]
            ),
        )
    if req.method == 'GET':
        if session.user is not None and session.user.korma_data is not None:
            page_form.fill(session.user.korma_data.get('personne', {}))
        return templates.render(
            ctx,
            '/personne.mako',
            errors = None,
            page_form = page_form,
            )

    params = req.params
    korma_inputs = variabledecode.variable_decode(params)
    page_form.fill(korma_inputs)
    korma_data, errors = page_form.root_input_to_data(korma_inputs, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/personne.mako',
            errors = errors,
            page_form = page_form,
            )

    if session.user.korma_data is None:
        session.user.korma_data = {}
    session.user.korma_data.setdefault('personne', {}).update(korma_data)
    session.user.save(ctx, safe = True)

    api_data, errors = conv.user_data_to_api_data(session.user.korma_data, state = ctx)
    if errors is not None:
        return templates.render(
            ctx,
            '/personne.mako',
            api_data = api_data,
            errors = errors,
            page_form = page_form,
            )
    simulation, errors = conv.data_to_simulation(api_data, state = ctx)
    if errors is not None:
        # TODO(rsoufflet) Make a real 500 internal error
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'API Error: {0}').format(errors))
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    return wsgihelpers.redirect(ctx, location = '/declaration-impot')
