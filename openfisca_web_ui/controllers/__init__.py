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


import logging

from formencode import variabledecode
from korma.date import Date
from korma.group import List
from korma.repeat import Repeat
from korma.text import Number, Text

from .. import contexts, conv, matplotlib_helpers, templates, urls, wsgihelpers
from . import accounts, sessions, simulations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    return wsgihelpers.redirect(ctx, location = '/personne')


@wsgihelpers.wsgify
def declaration_impot(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/declaration-impot.mako')


@wsgihelpers.wsgify
def famille(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/famille.mako')


@wsgihelpers.wsgify
def logement_principal(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/logement-principal.mako')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    router = urls.make_router(
        ('GET', '^/?$', index),
        (('GET', 'POST'), '^/personne/?$', personne),
        ('GET', '^/declaration-impot/?$', declaration_impot),
        ('GET', '^/famille/?$', famille),
        ('GET', '^/logement-principal/?$', logement_principal),

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
    if session.user_id is None:
        user = model.Account()
        user._id = unicode(uuid.uuid4())
        user.compute_words()
        user.save(ctx, safe = True)
        session.user_id = user._id
    session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.save(ctx, safe = True)

    first_page_forms = Repeat(
        count = 2,
        name = 'personnes',
        question = List(
            name = 'person_data',
            questions = [
                Number(label = u'Salaire imposable annuel', name = 'maxrev'),
                Text(label = u'Situation'),
                Date(label = u'Date de naissance', name = 'birth'),
                Number(label = u'Année', name = 'year'),
                ]
            ),
        )
    if req.method == 'GET':
        return templates.render(
            ctx,
            '/personne.mako',
            first_page_forms = first_page_forms,
            img_name = None,
            img2_name = None,
            )

    params = req.params
    korma_inputs = variabledecode.variable_decode(params)
    korma_data, errors = first_page_forms.root_input_to_data(korma_inputs, state = ctx)
    if errors is not None:
        first_page_forms.fill(korma_inputs)
        return templates.render(
            ctx,
            '/personne.mako',
            errors = errors,
            first_page_forms = first_page_forms,
            img_name = None,
            img2_name = None,
            )
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'Error: {0}').format(errors))

    inputs = {
        'maxrev': max([person['person_data'].get('maxrev') for person in korma_inputs['repeat']]),
        'nmen': len(korma_inputs['repeat']),
        'scenarios': [{
            'indiv': [
                {
                    'birth': person['person_data'].get('birth'),
                    'noichef': 0,
                    'noidec': 0,
                    'noipref': 0,
#                    'quifam': 'chef',
#                    'quifoy': 'vous',
#                    'quimen': 'pref',
                    }
                for person in korma_inputs['repeat']
                ],
            'year': korma_inputs['repeat'][0]['person_data'].get('year') or 2006,
            }],
        'x_axis': 'sali',
        }
    data, errors = conv.struct(
        {
            'maxrev': conv.pipe(conv.anything_to_int, conv.default(14000)),
            'nmen': conv.pipe(conv.anything_to_int, conv.default(3)),
            'scenarios': conv.pipe(
                conv.uniform_sequence(
                    conv.struct(
                        {
                            'declar': conv.default({'0': {}}),
                            'famille': conv.default({'0': {}}),
                            'indiv': conv.uniform_sequence(
                                conv.struct(
                                    {
                                        'birth': conv.pipe(conv.cleanup_line, conv.not_none),
                                        'noichef': conv.pipe(conv.anything_to_int, conv.default(0)),
                                        'noidec': conv.pipe(conv.anything_to_int, conv.default(0)),
                                        'noipref': conv.pipe(conv.anything_to_int, conv.default(0)),
                                        'quifam': conv.pipe(conv.cleanup_line, conv.default('chef')),
                                        'quifoy': conv.pipe(conv.cleanup_line, conv.default('vous')),
                                        'quimen': conv.pipe(conv.cleanup_line, conv.default('pref')),
                                        },
                                    drop_none_values = False,
                                    ),
                                ),
                            'menage': conv.default({'0': {}}),
                            'year': conv.pipe(
                                conv.anything_to_int,
                                conv.test_greater_or_equal(1950),
                                conv.test_less_or_equal(2015),
                                ),
                            },
                        ),
                    drop_none_items = True,
                    ),
                conv.test(lambda l: len(l) > 0, error = ctx._('You must provide at least one scenario')),
                ),
            'x_axis': conv.pipe(conv.default('sali'), conv.test_in(['sali'])),
            },
        )(inputs, state = ctx)

    if session.user.korma_data is None:
        session.user.korma_data = {}
    session.user.korma_data.update(korma_data)

    if errors is not None:
        return templates.render(
            ctx,
            '/personne.mako',
            api_data = api_data,
            errors = errors,
            first_page_forms = first_page_forms,
            img_name = None,
            img2_name = None,
            )
    simulation, errors = conv.data_to_simulation(api_data, state = ctx)
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'Data Error: {0}').format(errors))

    simulation, errors = conv.data_to_simulation(data, state = ctx)
    if errors is not None:
        # TODO(rsoufflet) Make a real 500 internal error
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'API Error: {0}').format(errors))
    trees = simulation['value']

    matplotlib_helpers.create_waterfall_png(trees, filename = 'waterfall.png')
    matplotlib_helpers.create_bareme_png(trees, simulation, filename = 'bareme.png')

    return wsgihelpers.redirect(ctx, location = '/declaration-impot')
