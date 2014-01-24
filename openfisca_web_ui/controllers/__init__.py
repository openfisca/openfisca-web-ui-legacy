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


bootstrap_control_inner_html_template = u'''
<label class="col-sm-6 control-label" for="{self.full_name}">{self.label}</label>
<div class="col-sm-6">
  {self.control_html}
</div>'''
bootstrap_group_outer_html_template = u'<div class="form-group">{self.inner_html}</div>'
default_korma_data = {'declaration_impot': {}, 'famille': {}, 'personne': {},}
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
            '_inner_html_template': bootstrap_control_inner_html_template,
            '_outer_html_template': bootstrap_group_outer_html_template,
            },
        name = u'all_questions',
        questions = group_questions,
        )

    if session.user.korma_data is None:
        session.user.korma_data = {}
    if data['entity'] == 'fam':
        user_data = session.user.korma_data['famille']['famille_repeat'][data['idx']]
    elif data['entity'] == 'foy':
        user_data = session.user.korma_data['declaration_impot']['declaration_impot_repeat'][data['idx']]
    elif data['entity'] == 'ind':
        user_data = session.user.korma_data['personne']['personnes'][data['idx']]

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
    user_data.update(korma_data)
    session.user.save(ctx, safe = True)

    api_data, errors = conv.korma_data_to_api_data(session.user.korma_data, state = ctx)
    if errors is not None:
        return templates.render(ctx, '/index.mako', errors = errors)

    simulation, errors = conv.data_to_simulation(api_data, state = ctx)
    if errors is not None:
        return templates.render(ctx, '/index.mako', errors = errors)
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    raise wsgihelpers.redirect(ctx, location = '/personne')


@wsgihelpers.wsgify
def index(req):
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

    params = req.params
    inputs = {
        'type': params.get('type'),
        }
    preset_type, error = conv.test_in(['celibataire', 'famille-trad', 'famille-recomp', 'autre'])(inputs['type'], state = ctx)
    if error is not None or inputs['type'] is None:
        return templates.render(ctx, '/index.mako', errors = error)

    preset_by_type = {
        'celibataire': {
            u'declaration_impot': {u'declaration_impot_repeat': [
                {u'declaration_impot': {u'conj': None, u'pac_repeat': [{u'pac': None}], u'vous': u'0'}}
                ]},
            u'famille': {u'famille_repeat': [
                {u'famille': {u'enf_repeat': [{u'enf': None}], u'parent1': u'0', u'parent2': None}}
                ]},
            u'personne': {u'personnes': [
                {u'person_data': {u'activite': u'actif_occupe', u'birth': datetime.datetime(1986, 8, 22, 0, 0),
                    u'sali': 24000.0, u'name': 'Personne declarant', u'statut_marital': u'celibataire'}}
                ]}
            },
        'famille-trad': {
            u'declaration_impot': {u'declaration_impot_repeat': [
                {u'declaration_impot': {u'conj': u'1', u'pac_repeat': [{u'pac': u'2'}, {u'pac': u'3'}], u'vous': u'0'}},
                ]},
            u'famille': {u'famille_repeat': [
                {u'famille': {u'enf_repeat': [{u'enf': u'2'}, {u'enf': u'3'}], u'parent1': u'0', u'parent2': u'1'}},
                ]},
            u'personne': {u'personnes': [
                {u'person_data': {u'activite': u'actif_occupe', u'birth': datetime.datetime(1985, 6, 3, 0, 0),
                    u'sali': 25500.0, u'name': 'parent1', u'statut_marital': u'marie'}},
                {u'person_data': {u'activite': u'etudiant_eleve', u'birth': datetime.datetime(1990, 11, 29, 0, 0),
                    u'sali': 5500.0, u'name': 'parent2', u'statut_marital': u'marie'}},
                {u'person_data': {u'activite': None, u'birth': None,
                    u'sali': None, u'name': 'enfant1', u'statut_marital': None}},
                {u'person_data': {u'activite': None, u'birth': None,
                    u'sali': None, u'name': 'enfant2', u'statut_marital': None}},
                ]},
            },
        'famille-recomp': {
            u'declaration_impot': {u'declaration_impot_repeat': [
                {u'declaration_impot': {u'conj': None, u'pac_repeat': [{u'pac': u'2'}, {u'pac': None}], u'vous': u'0'}},
                {u'declaration_impot': {u'conj': None, u'pac_repeat': [{u'pac': u'3'}, {u'pac': None}], u'vous': u'1'}},
                ]},
            u'famille': {u'famille_repeat': [
                {u'famille': {u'enf_repeat': [{u'enf': u'2'}, {u'enf': None}], u'parent1': u'0', u'parent2': None}},
                {u'famille': {u'enf_repeat': [{u'enf': u'3'}, {u'enf': None}], u'parent1': u'1', u'parent2': None}},
                ]},
            u'personne': {u'personnes': [
                {u'person_data': {u'activite': u'actif_occupe', u'birth': datetime.datetime(1985, 6, 3, 0, 0),
                    u'sali': 25500.0, u'name': 'parent1', u'statut_marital': u'marie'}},
                {u'person_data': {u'activite': u'etudiant_eleve', u'birth': datetime.datetime(1990, 11, 29, 0, 0),
                    u'sali': 5500.0, u'name': 'parent2', u'statut_marital': u'marie'}},
                {u'person_data': {u'activite': None, u'birth': None,
                    u'sali': None, u'name': 'enfant1', u'statut_marital': None}},
                {u'person_data': {u'activite': None, u'birth': None,
                    u'sali': None, u'name': 'enfant2', u'statut_marital': None}}
                ]}
            },
        'autre': {},
        }

    if session.user.korma_data is None:
        session.user.korma_data = preset_by_type[preset_type]
        session.user.save(ctx, safe = True)

    api_data, errors = conv.korma_data_to_api_data(session.user.korma_data, state = ctx)
    if errors is not None:
        return templates.render(ctx, '/index.mako', errors = errors)

    simulation, errors = conv.data_to_simulation(api_data, state = ctx)
    if errors is not None:
        return templates.render(ctx, '/index.mako', errors = errors)
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    raise wsgihelpers.redirect(ctx, location = '/personne')


@wsgihelpers.wsgify
def declaration_impot(req):
    ctx = contexts.Ctx(req)
    session = ctx.session
    if session is None or session.user is None or session.user.korma_data.get('personne') is None:
        raise wsgihelpers.redirect(ctx, location = '/personne')

    persons_value_and_name = [
        (unicode(idx), person['person_data'].get('name') or idx)
        for idx, person in enumerate(session.user.korma_data['personne']['personnes'] or [])
        ]
    page_form = Repeat(
        children_attributes = {
            '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=foy&idx={self.parent_data[declaration_impot_repeat][index]}"
class="btn btn-primary"> Plus de détails</a></div>''',
            },
        template_question = Group(
            children_attributes = {
                '_outer_html_template': bootstrap_group_outer_html_template,
                },
            name = 'declaration_impot',
            questions = [
                Select(
                    choices = persons_value_and_name,
                    control_attributes = {'class': 'form-control'},
                    inner_html_template = bootstrap_control_inner_html_template,
                    label = u'Vous',
                    ),
                Select(
                    choices = persons_value_and_name,
                    control_attributes = {'class': 'form-control'},
                    inner_html_template = bootstrap_control_inner_html_template,
                    label = u'Conj',
                    ),
                Repeat(
                    template_question = Select(
                        choices = persons_value_and_name,
                        control_attributes = {'class': 'form-control'},
                        label = u'Personne à charge',
                        inner_html_template = bootstrap_control_inner_html_template,
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

    api_data, errors = conv.korma_data_to_api_data(session.user.korma_data, state = ctx)
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
        return templates.render(
            ctx,
            '/declaration-impot.mako',
            api_data = api_data,
            errors = errors,
            page_form = page_form,
            )
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

    persons_value_and_name = [
        (unicode(idx), person['person_data'].get('name') or idx)
        for idx, person in enumerate(session.user.korma_data['personne']['personnes'] or [])
        ]
    page_form = Repeat(
        children_attributes = {
            '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=fam&idx={self.parent_data[famille_repeat][index]}" class="btn btn-primary">
Plus de détails</a></div>''',
            },
        outer_html_template = u'<div class="repeat">{self.inner_html}</div>',
        template_question = Group(
            children_attributes = {
                '_outer_html_template': bootstrap_group_outer_html_template,
                },
            name = 'famille',
            questions = [
                Select(
                    choices = persons_value_and_name,
                    control_attributes = {'class': 'form-control'},
                    inner_html_template = bootstrap_control_inner_html_template,
                    label = u'Parent1',
                    ),
                Select(
                    choices = persons_value_and_name,
                    control_attributes = {'class': 'form-control'},
                    inner_html_template = bootstrap_control_inner_html_template,
                    label = u'Parent2',
                    ),
                Repeat(
                    template_question = Select(
                        choices = persons_value_and_name,
                        control_attributes = {'class': 'form-control'},
                        inner_html_template = bootstrap_control_inner_html_template,
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

    api_data, errors = conv.korma_data_to_api_data(session.user.korma_data, state = ctx)
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
        return templates.render(
            ctx,
            '/famille.mako',
            api_data = api_data,
            errors = errors,
            page_form = page_form,
            )
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
        children_attributes = {
            '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=men&idx={self.parent_data[logement_principal_repeat][index]}"
class="btn btn-primary">Plus de détails</a></div>''',
            },
        template_question = Group(
            outer_html_template = u'<div class="repeated-group">{self.inner_html}</div>',
            children_attributes = {
                '_control_attributes': {'class': u'form-control'},
                '_inner_html_template': bootstrap_control_inner_html_template,
                '_outer_html_template': bootstrap_group_outer_html_template,
                },
            name = 'logement_principal',
            questions = [
                Select(
                    choices = [
                        u'Non renseigné',
                        u'Accédant à la propriété',
                        u'Propriétaire (non accédant) du logement',
                        u'Locataire d\'un logement HLM',
                        u'Locataire ou sous-locataire d\'un logement loué vide non-HLM',
                        u'Locataire ou sous-locataire d\'un logement loué meublé ou d\'une chambre d\'hôtel',
                        u'Logé gratuitement par des parents, des amis ou l\'employeur',
                        ],
                    first_unselected = True,
                    label = u'Statut d\'occupation',
                    name = u'so',
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

    api_data, errors = conv.korma_data_to_api_data(session.user.korma_data, state = ctx)
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
        return templates.render(
            ctx,
            '/famille.mako',
            api_data = api_data,
            errors = errors,
            page_form = page_form,
            )
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    return wsgihelpers.redirect(ctx, location = '/logement-principal')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    router = urls.make_router(
        (('GET', 'POST'), '^/?$', index),
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
        children_attributes = {
            '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=ind&idx={self.parent_data[personnes][index]}" class="btn btn-primary">
Plus de détails</a></div>''',
            },
        outer_html_template = u'<div class="repeat">{self.inner_html}</div>',
        name = 'personnes',
        template_question = Group(
            children_attributes = {
                '_control_attributes': {'class': 'form-control'},
                '_inner_html_template': bootstrap_control_inner_html_template,
                '_outer_html_template': bootstrap_group_outer_html_template,
                },
            name = 'person_data',
            outer_html_template = u'<div class="repeated-group">{self.inner_html}</div>',
            questions = [
                Text(
                    label = u'Nom',
                    name = 'name',
                    ),
                Number(
                    label = u'Salaire imposable annuel',
                    name = 'sali',
                    step = 1,
                    ),
                Select(
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
                    label = u'Date de naissance',
                    name = 'birth'),
                Select(
                    choices = [
                        u'Marié',
                        u'Célibataire',
                        u'Divorcé',
                        u'Veuf',
                        u'Pacsé',
                        u'Jeune veuf',
                        ],
                    first_unselected = True,
                    label = u'Statut marital',
                    name = u'statmarit',
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

    api_data, errors = conv.korma_data_to_api_data(session.user.korma_data, state = ctx)
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
        return templates.render(
            ctx,
            '/personne.mako',
            api_data = api_data,
            errors = errors,
            page_form = page_form,
            )
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    return wsgihelpers.redirect(ctx, location = '/declaration-impot')
