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


"""Conversion functions"""


import collections
import datetime
import json
import re
import urllib2

from biryani1.baseconv import *  # NOQA
from biryani1.bsonconv import *  # NOQA
from biryani1.datetimeconv import *  # NOQA
from biryani1.objectconv import *  # NOQA
from biryani1.jsonconv import *  # NOQA
from biryani1.states import default_state, State  # NOQA
import openfisca_france.model.data


N_ = lambda message: message
json_handler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) else obj
uuid_re = re.compile(ur'[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$')


api_data_to_api_post_content = function(lambda api_data: json.dumps(api_data, default = json_handler))


def api_post_content_to_simulation_output(api_post_content, state = None):
    from . import conf
    if api_post_content is None:
        return None, None
    if state is None:
        state = default_state
    request = urllib2.Request(conf['api.url'], headers = {
        'Content-Type': 'application/json',
        'User-Agent': conf['app_name'],
        })
    try:
        response = urllib2.urlopen(request, api_post_content)
    except urllib2.HTTPError as response:
        return api_post_content, response.read()
    except urllib2.URLError as response:
        return api_post_content, response.read()
    response_str = response.read()
    simulation_output = json.loads(response_str, object_pairs_hook = collections.OrderedDict)
    return simulation_output, None


api_data_to_simulation_output = pipe(api_data_to_api_post_content, api_post_content_to_simulation_output)


date_to_datetime = function(lambda value: datetime.datetime(*(value.timetuple()[:6])))


datetime_to_date = function(lambda value: value.date())


input_to_uuid = pipe(
    cleanup_line,
    test(uuid_re.match, error = N_(u'Invalid UUID format')),
    )


input_to_words = pipe(
    input_to_slug,
    function(lambda slug: sorted(set(slug.split(u'-')))),
    empty_to_none,
    )


def method(method_name, *args, **kwargs):
    def method_converter(value, state = None):
        if value is None:
            return value, None
        return getattr(value, method_name)(state or default_state, *args, **kwargs)
    return method_converter


def korma_data_to_api_data(values, state = None):
    def extract_famille_data(person_index, famille_data):
        for famille_repeat_index, famille_repeat_data in enumerate(famille_data['famille_repeat']):
            famille = famille_repeat_data['famille']
            if famille['parent1'] is not None and person_index == int(famille['parent1']):
                return u'chef', famille_repeat_index
            elif famille['parent2'] is not None and person_index == int(famille['parent2']):
                return u'part', famille_repeat_index
            elif famille['enf_repeat'] is not None:
                for enf_repeat_index, enf_repeat_data in enumerate(famille['enf_repeat']):
                    if enf_repeat_data['enf'] is not None and person_index == int(enf_repeat_data['enf']):
                        return u'enf{}'.format(int(enf_repeat_index) + 1), famille_repeat_index
        return None, None

    def extract_declaration_impot_data(person_index, declaration_impot_data):
        for declaration_impot_repeat_index, declaration_impot_repeat_data in enumerate(
                declaration_impot_data['declaration_impot_repeat']):
            declaration_impot = declaration_impot_repeat_data['declaration_impot']
            if declaration_impot['vous'] is not None and person_index == int(declaration_impot['vous']):
                return u'vous', declaration_impot_repeat_index
            elif declaration_impot['conj'] is not None and person_index == int(declaration_impot['conj']):
                return u'conj', declaration_impot_repeat_index
            elif declaration_impot['pac_repeat'] is not None:
                for pac_repeat_index, pac_repeat_data in enumerate(declaration_impot['pac_repeat']):
                    if pac_repeat_data['pac'] is not None and person_index == int(pac_repeat_data['pac']):
                        return u'pac{}'.format(int(pac_repeat_index) + 1), declaration_impot_repeat_index
        return None, None

    def iter_api_variables(korma_data, keep_entities=None):
        api_vars_name = openfisca_france.model.data.column_by_name.keys()
        api_vars_name.extend([u'birth'])
        for k, v in korma_data.iteritems():
            if k in api_vars_name and v is not None:
                yield k, v
#                korma_data.column_by_name[k].entity

    if values is None:
        return None, None
    if state is None:
        state = default_state

    for key in ('declaration_impot', 'famille', 'personne'):
        if key not in values:
            return values, u'Veuillez remplir l\'onglet "{}"'.format(key)

    persons_data = values.get('personne', {}).get('personnes')
    # TODO(rsoufflet) Ask for annual revenue. Annual revenu != "net mensuel * 12"

    api_noidec_by_korma_declaration_impot_index = {}
    api_noichef_by_korma_famille_index = {}
    declarations = {}
    familles = {}
    menages = {u'0': {}}
    individus = []
    for person_index, person in enumerate(persons_data):
        quifam, korma_famille_index = extract_famille_data(person_index, values['famille'])
        if quifam == u'chef':
            familles[unicode(person_index)] = {}
            api_noichef_by_korma_famille_index[korma_famille_index] = person_index
        quifoy, korma_declaration_impot_index = extract_declaration_impot_data(
            person_index, values['declaration_impot'])
        if quifoy == u'vous':
            declarations[unicode(person_index)] = {}
            api_noidec_by_korma_declaration_impot_index[korma_declaration_impot_index] = person_index
        individu = {
            'noichef': api_noichef_by_korma_famille_index[korma_famille_index],
            'noidec': api_noidec_by_korma_declaration_impot_index[korma_declaration_impot_index],
            'noipref': person_index,
            'quifam': quifam,
            'quifoy': quifoy,
            'quimen': 'pref',
            }
        individu.update(iter_api_variables(person['person_data']))
        if 'all_questions' in person:
            individu.update(iter_api_variables(person['all_questions']))
        individus.append(individu)

    api_data = {
        'scenarios': [
            {
                'declar': declarations,
                'famille': familles,
                'indiv': individus,
                'menage': menages,
                'year': 2006,
                },
            ],
        }
    return api_data, None
