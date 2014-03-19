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
import json
import logging

from biryani1.baseconv import function, pipe
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
