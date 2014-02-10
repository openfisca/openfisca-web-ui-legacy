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

from biryani1.baseconv import function, pipe
from biryani1.states import default_state
import requests

from .. import questions


json_handler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) else obj


def api_post_content_to_simulation_output(api_post_content, state = None):
    from .. import conf
    if api_post_content is None:
        return None, None
    if state is None:
        state = default_state
    try:
        response = requests.post(
            conf['api.urls.simulate'],
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': conf['app_name'],
                },
            data = api_post_content,
            )
    except requests.exceptions.ConnectionError:
        return api_post_content, state._('Unable to connect to API, url: {}').format(conf['api.urls.simulate'])
    if not response.ok:
        try:
            response_data = response.json(object_pairs_hook = collections.OrderedDict)
        except ValueError as exc:
            return api_post_content, unicode(exc)
        return api_post_content, response_data.get('error')
    simulation_output = response.json(object_pairs_hook = collections.OrderedDict)
    return simulation_output, None


api_data_to_api_post_content = function(lambda api_data: json.dumps(api_data, default = json_handler))


def fill_user_api_data(values, state = None):
    """Compute missing values for API consistency and fill user API data with them."""
    from .. import model
    if values is None:
        return None, None
    if state is None:
        state = default_state
    individus = questions.individus.default_value() if values.get('individus') is None else values['individus']
    for individu_id, individu in individus.iteritems():
        if individu.get(u'birth') is None:
            individu[u'birth'] = questions.individus.default_values['birth']
    new_values = {u'individus': individus}
    individu_ids = individus.keys()
    familles = questions.familles.default_value(individu_ids=individu_ids) if values.get('familles') is None \
        else values['familles']
    new_values['familles'] = familles
    foyers_fiscaux = questions.foyers_fiscaux.default_value(familles=familles) if values.get('foyers_fiscaux') is None \
        else values['foyers_fiscaux']
    new_values['foyers_fiscaux'] = foyers_fiscaux
    menages = questions.menages.default_value(familles=familles, individu_ids=individu_ids) \
        if values.get('menages') is None else values['menages']
    new_values['menages'] = menages
    if values.get('legislation_url') is None:
        legislation = model.Legislation.find_one()
        if legislation is not None:
            new_values['legislation_url'] = legislation.get_api1_full_url(state, 'json')
    if values.get('year') is None:
        new_values['year'] = 2013
    return new_values, None


def user_api_data_to_api_data(user_data, state = None):
    if user_data is None:
        return None, None
    if state is None:
        state = default_state

    api_data = {
        'familles': user_data.get('familles', {}).values(),
        'foyers_fiscaux': user_data.get('foyers_fiscaux', {}).values(),
        'menages': user_data.get('menages', {}).values(),
        'individus': [],
        'legislation_url': user_data.get('legislation_url'),
        'year': user_data.get('year', 2013),
        }
    for individu_id in user_data.get('individus', {}).iterkeys():
        individu = dict(
            (key, value)
            for key, value in user_data['individus'][individu_id].iteritems()
            )
        individu['id'] = individu_id
        if 'prenom' in individu:
            del individu['prenom']
        api_data['individus'].append(individu)
    return {'scenarios': [api_data]}, None


user_api_data_to_simulation_output = pipe(
    fill_user_api_data,
    user_api_data_to_api_data,
    api_data_to_api_post_content,
    api_post_content_to_simulation_output,
    )
