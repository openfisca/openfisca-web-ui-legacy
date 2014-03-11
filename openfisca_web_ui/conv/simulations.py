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


"""Conversion functions related to simulations"""


import collections
import datetime
from itertools import chain
import json
import logging

from biryani1.baseconv import condition, default, function, noop, pipe, struct, test, uniform_sequence, rename_item
from biryani1.states import default_state
import requests


DEFAULT_YEAR = 2013

json_handler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) else obj
log = logging.getLogger(__name__)


api_data_to_api_post_content = function(lambda api_data: json.dumps(api_data, default = json_handler))


def api_post_content_to_simulation_output(api_post_content, state = None):
    from .. import conf
    if api_post_content is None:
        return None, None
    if state is None:
        state = default_state
    response = requests.post(
        conf['api.urls.simulate'],
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': conf['app_name'],
            },
        data = api_post_content,
        )
    response_data = response.json(object_pairs_hook = collections.OrderedDict)
    return (response_data, None) if response.ok else (api_post_content, response_data.get('error'))


def scenarios_api_data_to_api_data(scenarios_api_data, state = None):
    # FIXME merge with user_api_data_to_api_data?
    if scenarios_api_data is None:
        return None, None
    if state is None:
        state = default_state

    scenarios = []
    for scenario_api_data in scenarios_api_data:
        api_data = {
            'test_case': dict(
                (key, value.values())
                for key, value in scenario_api_data.get('test_case', {}).iteritems()
                if key != 'year' and key != 'individus'
                ),
            'legislation_url': scenario_api_data.get('legislation_url'),
            'year': scenario_api_data.get('year', DEFAULT_YEAR),
            }
        individus = []
        for individu_id in scenario_api_data['test_case'].get('individus', {}).iterkeys():
            individu = dict(
                (key, value)
                for key, value in scenario_api_data['test_case']['individus'][individu_id].iteritems()
                )
            individu['id'] = individu_id
            individus.append(individu)
        api_data['test_case']['individus'] = individus
        scenarios.append(api_data)
    return {'scenarios': scenarios}, None


def scenarios_to_api_data(values, state = None):
    from .. import model
    from . import base
    return pipe(
        uniform_sequence(
            pipe(
                struct(
                    {
                        'legislation_id': pipe(
                            model.Legislation.make_id_or_slug_or_words_to_instance(),
                            condition(
                                test(lambda legislation: legislation.url is None),
                                function(lambda legislation: legislation.get_api1_full_url(state, 'json')),
                                function(lambda legislation: legislation.url),
                                ),
                            ),
                        'test_case_id': pipe(
                            model.TestCase.make_id_or_slug_or_words_to_instance(),
                            function(lambda test_case: test_case.api_data if test_case.api_data is not None else {}),
                            base.make_fill_user_api_data(ensure_api_compliance = True),
                            ),
                        'year': default(DEFAULT_YEAR),
                        },
                    default = noop,
                    drop_none_values = False,
                    ),
                rename_item('legislation_id', 'legislation_url'),
                rename_item('test_case_id', 'test_case'),
                ),
            ),
        scenarios_api_data_to_api_data,
    )(values, state = state)


def user_api_data_to_api_data(user_data, state = None):
    if user_data is None:
        return None, None
    if state is None:
        state = default_state

    test_case = {
        'familles': user_data.get('familles', {}).values(),
        'foyers_fiscaux': user_data.get('foyers_fiscaux', {}).values(),
        'menages': user_data.get('menages', {}).values(),
        'individus': [],
        }
    for individu_id in user_data.get('individus', {}).iterkeys():
        individu = dict(
            (key, value)
            for key, value in user_data['individus'][individu_id].iteritems()
            )
        individu['id'] = individu_id
        test_case['individus'].append(individu)
    scenario = {
        'test_case': test_case,
        'year': user_data.get('year', DEFAULT_YEAR),
        }
    return {'scenarios': [scenario]}, None


# Level 2 converters

api_data_to_simulation_output = pipe(
    api_data_to_api_post_content,
    api_post_content_to_simulation_output,
    )
