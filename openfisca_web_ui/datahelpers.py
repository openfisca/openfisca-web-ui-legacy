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


"""Helpers to handle uuid"""


from . import conv


def add_deep_key(data, layers):
    if data is None:
        return False
    node = get_deep_key(data, layers[:-1])
    print node
    print layers
    raise Exception
    if node is None:
        return False

    if isinstance(node, list):
        key, error = conv.input_to_int(layers[-1])
    elif isinstance(node, dict):
        key, error = layers[-1], None if key in node else True
    else:
        return False

    if error is not None:
        return False
    del node[key]
    return True


def delete_deep_key(data, layers):
    if data is None:
        return False
    node = get_deep_key(data, layers[:-1])
    if node is None:
        return False

    if isinstance(node, list):
        key, error = conv.input_to_int(layers[-1])
    elif isinstance(node, dict):
        key, error = layers[-1], None if key in node else True
    else:
        return False

    if error is not None:
        return False
    del node[key]
    return True


def get_deep_key(data, layers):
    if data is None:
        return None
    layer = layers[0]
    next_layers = layers[1:]
    if isinstance(data, list):
        layer_data = data[int(layer)]
    elif data.get('children') is not None:
        layer_data = data['children'].get(layer)
    else:
        layer_data = data.get(layer)
    return get_deep_key(data = layer_data, layers = next_layers) if next_layers else layer_data
