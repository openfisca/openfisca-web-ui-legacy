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


"""Matplotlib functions"""  # TODO(rsoufflet) This file will disappear as soon as graphs are rendered client-side


import collections
from cStringIO import StringIO
import operator

import matplotlib
# This is a hack to use matlplotlib without X
# http://stackoverflow.com/questions/4931376/generating-matplotlib-graphs-without-a-running-x-server
matplotlib.use('Agg')
from matplotlib.lines import Line2D
from matplotlib.patches import FancyArrow, Rectangle
from matplotlib import pyplot
import numpy


waterfall_image_resolution = (1200, 900)
bareme_image_resolution = (800, 500)


def iter_columns_from_tree(node, base_value = 0, code = None):
    value_index = -1
    children = node.get('children')
    if children:
        child_base_value = base_value
        for child_code, child in children.iteritems():
            for column in iter_columns_from_tree(child, base_value = child_base_value, code = child_code):
                yield column
            child_base_value += child['values'][value_index]

    value = node['values'][value_index]
    if value != 0 and code is not None:
        column = dict(
            base_value = base_value,
            code = code,
            value = value,
            )
        column.update(node)
        yield column


def draw_legend(ax):
    artists = []
    labels = []
    for collection in ax.collections:
        if collection._visible:
            artists.insert(
                0,
                Rectangle((0, 0), 1, 1, fc = collection._facecolors[0], linewidth = 0.5, edgecolor = 'black'),
                )
            labels.insert(0, collection._label)
    for line in ax.lines:
        if line._visible:
            artists.insert(0, Line2D([0, 1], [.5, .5], color = line._color))
            labels.insert(0, line._label)
    ax.legend(artists, labels, bbox_to_anchor = (1.05, 1), loc = 2, prop = {'size': 'medium'})


def draw_node(ax, node, base_values, x_values, code = None):
    if code is not None and any([value != 0 for value in node['values']]):
        color = [float(item) / 255 for item in node['color']]
        if node['type'] == 2:
            ax.plot(x_values, node['values'], color = color, label = node['description'], linewidth = 2)
        else:
            area = ax.fill_between(x_values, map(operator.add, base_values, node['values']), base_values,
                color = color, edgecolor = 'black', linewidth = 0.2, picker = True)
            area.set_label(node['description'])
    for child_code, child in (node.get('children') or {}).iteritems():
        draw_node(ax, child, base_values, x_values, code = child_code)
        base_values = map(operator.add, base_values, child['values'])


def iter_nodes_from_tree(node, code = None):
    for child_code, child in (node.get('children') or {}).iteritems():
        for descendant_code, descendant_node in iter_nodes_from_tree(child, code = child_code):
            yield descendant_code, descendant_node
    if code is not None:
        yield code, node


def create_waterfall_png(trees):
    bar_width = 0.8
    title = u'Revenu annuel'
    tree = trees[0]
    xlabel = u'Prélèvements et prestations sociales'
    ylabel = u'Montant en €'

    figure = pyplot.figure(
        figsize = (float(waterfall_image_resolution[0]) / 100, float(waterfall_image_resolution[1]) / 100),
        dpi = 100,
        )
    ax = figure.add_subplot(111)
    ax.set_title(title)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.set_xscale('linear')
    ax.set_yscale('linear')

    names = []
    for column_index, column in enumerate(iter_columns_from_tree(tree)):
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

    image_data = StringIO()
    figure.savefig(image_data, format = 'png')
    pyplot.close(figure)
    image_data.seek(0)
    return image_data


def create_bareme_png(trees, simulation):
    title = u'Variation du revenu disponible' if simulation.get('reform') else u'Revenu disponible'
    tree = trees[0]
    ylabel = u'Revenu disponible (en € par an)'

    figure = pyplot.figure(
        figsize = (float(bareme_image_resolution[0]) / 100, float(bareme_image_resolution[1]) / 100),
        dpi = 150,
        )
    ax = figure.add_subplot(111)
    ax.set_title(title)
    figure.subplots_adjust(bottom = 0.09, top = 0.95, left = 0.11, right = 0.95)

    code_node_couples = collections.OrderedDict(iter_nodes_from_tree(tree))
    x_node = code_node_couples['sal']
    x_values = x_node['values']
    ax.set_xlabel(x_node['description'])
    ax.set_xlim(min(x_values), max(x_values))
    ax.set_ylabel(ylabel)

    draw_node(ax, tree, [0] * len(x_values), x_values)
    draw_legend(ax)
    image_data = StringIO()
    figure.savefig(image_data, format = 'png')
    pyplot.close(figure)
    image_data.seek(0)
    return image_data
