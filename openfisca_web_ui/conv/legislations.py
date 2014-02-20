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


"""Conversion functions related to legislation URLs and year"""


import collections
import json
import requests

from biryani1.baseconv import function, pipe, uniform_sequence
from biryani1.states import default_state

from . import base
from .. import conf


def scenarios_to_page_korma_data(scenarios, state = None):
    if scenarios is None:
        scenarios = [{}]
    return {
        'legislations': [
            {'legislation': scenario}
            for scenario in scenarios
            ],
        }, None


def korma_data_to_page_api_data(values, state = None):
    if values is None:
        return None, None
    if state is None:
        state = default_state
    scenarios, error = pipe(
        function(lambda data: data.get(u'legislations')),
        uniform_sequence(
            function(lambda data: data.get('legislation')),
            ),
        )(values, state)
    if error is not None:
        return values, error
    if values.get('add'):
        scenarios.append({})
    return scenarios, None


def validate_legislation_json(json_dict, state = None):
    if json_dict is None:
        return None, None
    if state is None:
        state = default_state
    try:
        response = requests.post(
            conf['api.urls.legislations'],
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': conf['app_name'],
                },
            data = json.dumps(dict(value = json_dict)),
            )
    except requests.exceptions.ConnectionError:
        return json_dict, state._('Unable to connect to API, url: {}').format(conf['api.urls.legislations'])
    if not response.ok:
        try:
            return json_dict, response.json(object_pairs_hook = collections.OrderedDict)
        except ValueError as exc:
            return json_dict, unicode(exc)
    return json_dict, None


def retrieve_legislation(url, state = None):
    if url is None:
        return None, None
    if state is None:
        state = default_state
    try:
        response = requests.get(url)
    except requests.exceptions.ConnectionError:
        return url, state._('Unable to connect to URL: {}').format(url)
    if not response.ok:
        return url, state._('URL {} respond with status code {}').format(url, response.status_code)
    try:
        return response.json(object_pairs_hook = collections.OrderedDict), None
    except ValueError:
        return url, state._('URL {} doesn\'t returned valid JSON').format(url)
