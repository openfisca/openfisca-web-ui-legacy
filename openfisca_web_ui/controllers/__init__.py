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


import collections
import json
import logging
import urllib2

from matplotlib.patches import FancyArrow
from matplotlib import pyplot
import numpy

from .. import contexts, conv, matplotlib_helpers, templates, urls, wsgihelpers
from . import accounts, sessions, simulations


log = logging.getLogger(__name__)
router = None


@wsgihelpers.wsgify
def index(req):
    ctx = contexts.Ctx(req)
    return templates.render(ctx, '/index.mako')


def make_router():
    """Return a WSGI application that searches requests to controllers."""
    global router
    router = urls.make_router(
        ('GET', '^/?$', index),
        ('GET', '^/simulation?$', simulation),

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
def simulation(req):
    ctx = contexts.Ctx(req)
    params = req.params
    inputs = {
        'maxrev': params.get('maxrev'),
        'nmen': params.get('nmen'),
        'scenarios': [{
            'indiv': [{
                'birth': params.get('birth'),
                }],
            'year': params.get('year'),
            }],
        'x_axis': params.get('x_axis'),
        }
    data, errors = conv.struct(
        {
            'maxrev': conv.pipe(conv.input_to_int, conv.default(14000)),
            'nmen': conv.pipe(conv.input_to_int, conv.default(3)),
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
                                        'noichef': conv.pipe(conv.input_to_int, conv.default(0)),
                                        'noidec': conv.pipe(conv.input_to_int, conv.default(0)),
                                        'noipref': conv.pipe(conv.input_to_int, conv.default(0)),
                                        'quifam': conv.pipe(conv.cleanup_line, conv.default('chef')),
                                        'quifoy': conv.pipe(conv.cleanup_line, conv.default('vous')),
                                        'quimen': conv.pipe(conv.cleanup_line, conv.default('pref')),
                                        },
                                    drop_none_values = False,
                                    ),
                                ),
                            'menage': conv.default({'0': {}}),
                            'year': conv.pipe(
                                conv.input_to_int,
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
    if errors is not None:
        return wsgihelpers.bad_request(ctx, explanation = ctx._(u'Login Error: {0}').format(errors))

    request = urllib2.Request('http://api.raviart.com/api/1/simulate', headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenFisca-Notebook',
        })
    response = urllib2.urlopen(request, json.dumps(data))
    response_dict = json.loads(response.read(), object_pairs_hook = collections.OrderedDict)
    trees = response_dict['value']

    bar_width = 0.8
    title = u'Revenu annuel'
    tree = trees[0]
    xlabel = u'Prélèvements et prestations sociales'
    ylabel = u'Montant en €'

    figure = pyplot.figure(figsize = (12, 9), dpi = 100)
    ax = figure.add_subplot(111)
    ax.set_title(title)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.set_xscale('linear')
    ax.set_yscale('linear')

    names = []
    for column_index, column in enumerate(matplotlib_helpers.iter_columns_from_tree(tree)):
        r, g, b = column['color']
        base_value = column['base_value']
        value = column['value']
        arrow = FancyArrow(
            column_index + bar_width / 2,
            base_value, 0,
            value,
            width = bar_width,
            fc = (float(r) / 255, float(g) / 255, float(b) / 255),
            linewidth = 0.5,
            edgecolor = 'black',
            label = column['description'],
            picker = True,
            length_includes_head = True,
            head_width = bar_width,
            head_length = abs(value / 15),
            )

        ax.add_patch(arrow)
        rounded_value = round(value)
        ax.text(
            column_index + bar_width / 2,
            max(base_value, value) + 1,
            str(rounded_value),
            horizontalalignment = 'center',
            verticalalignment = 'bottom',
            color = 'black' if rounded_value >= 0 else 'red',
            weight = 'bold',
            )
        names.append(column['name'])

    xlim = (-bar_width / 2, len(names) - 1 + bar_width * 1.5)
    ax.plot(xlim, [0, 0], color = 'black')
    ax.set_xticklabels(names, rotation = '45')
    ax.set_xticks(numpy.arange(len(names)) + bar_width / 2)
    ax.set_xlim(xlim)

    figure.savefig('openfisca_web_ui/static/test.png')
    pyplot.close(figure)

    title = u'Variation du revenu disponible' if simulation.get('reform') else u'Revenu disponible'
    tree = trees[0]
    ylabel = u'Revenu disponible (en € par an)'

    figure = pyplot.figure(figsize = (8, 5), dpi = 100)
    ax = figure.add_subplot(111)
    ax.set_title(title)
    figure.subplots_adjust(bottom = 0.09, top = 0.95, left = 0.11, right = 0.95)

    code_node_couples = collections.OrderedDict(matplotlib_helpers.iter_nodes_from_tree(tree))
    x_node = code_node_couples['sal']
    x_values = x_node['values']
    ax.set_xlabel(x_node['description'])
    ax.set_xlim(min(x_values), max(x_values))
    ax.set_ylabel(ylabel)

    matplotlib_helpers.draw_node(ax, tree, [0] * len(x_values), x_values)
    matplotlib_helpers.draw_legend(ax)
    figure.savefig('openfisca_web_ui/static/test2.png')
    pyplot.close(figure)

    return templates.render(
        ctx,
        '/simulation.mako',
        data = data,
        errors = errors,
        img_name = '/test.png',
        img2_name = 'test2.png',
        )
