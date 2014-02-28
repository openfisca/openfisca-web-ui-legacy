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


import datetime
import logging
import re

from biryani1.baseconv import cleanup_line, empty_to_none, function, input_to_slug, merge, pipe, test
from biryani1.states import default_state

from . import familles as familles_conv
from . import foyers_fiscaux as foyers_fiscaux_conv
from . import menages as menages_conv


N_ = lambda message: message
log = logging.getLogger(__name__)
uuid_re = re.compile(ur'[\da-f]{32}$')


# Level 0 converters (utils)

def debug(value, state = None):
    from pprint import pprint
    pprint(value)
    return value, None


# Level 1 converters

api_data_to_korma_data = pipe(
    merge(
        familles_conv.api_data_to_korma_data,
        foyers_fiscaux_conv.api_data_to_korma_data,
        menages_conv.api_data_to_korma_data,
        ),
    function(lambda values: {'situation': values}),
    )


def build_categories(columns, entity_name):
    from .. import model
    categories = {}
    for column_name, column_value in columns.iteritems():
        category_name = model.find_category_name(column_name = column_name, entity_name = entity_name)
        if category_name is None:
            log.error(u'Unable to find category name from column_name: {!r} within entity: {!r}'.format(
                column_name, entity_name))
        else:
            categories.setdefault(category_name, {})[column_name] = column_value
    return categories


date_to_datetime = function(lambda value: datetime.datetime(*(value.timetuple()[:6])))


datetime_to_date = function(lambda value: value.date())


def make_fill_user_api_data(fill_columns_without_default_value = False):
    def fill_user_api_data(values, state = None):
        """Compute missing values for API consistency and fill user API data with them."""

        from .. import questions, uuidhelpers

        def guess_role_in_foyer_fiscal(individu_id):
            if individu_id in (last_foyer_fiscal.get('declarants') or []) or \
                    individu_id in (last_foyer_fiscal.get('personnes_a_charge') or []):
                return None
            return 'personnes_a_charge' if get_role_in_famille(individu_id, familles) == 'enfants' else 'declarants'

        def guess_role_in_menage(individu_id):
            if last_menage.get('personne_de_reference') == individu_id or \
                    last_menage.get('conjoint') == individu_id or \
                    individu_id in (last_menage.get('enfants') or []) or \
                    individu_id in (last_menage.get('autres') or []):
                return None
            role_in_famille = get_role_in_famille(individu_id, familles)
            if role_in_famille == 'parents':
                if last_menage.get('personne_de_reference') is None:
                    return 'personne_de_reference'
                elif last_menage.get('conjoint') is None:
                    return 'conjoint'
                else:
                    return 'autres'
            elif role_in_famille == 'enfants':
                return 'enfants'

        def get_role_in_famille(individu_id, familles):
            for famille_id, famille in familles.iteritems():
                for role in familles_conv.roles:
                    role_individu_ids = famille.get(role)
                    if role_individu_ids is not None:
                        if individu_id in role_individu_ids:
                            return role
            return None

        if values is None:
            return None, None
        if state is None:
            state = default_state

        # individus
        if values.get('individus'):
            default_individu_id = None
            individus = values['individus']
        else:
            default_individu_id = uuidhelpers.generate_uuid()
            individus = {default_individu_id: questions.individus.build_default_values()}
        if fill_columns_without_default_value:
            for individu_id, individu in individus.iteritems():
                for key, value in questions.base.custom_column_default_values.iteritems():
                    if individu.get(key) is None:
                        individu[key] = value
        new_values = {u'individus': individus}
        individu_ids = individus.keys()

        # familles
        familles = values['familles'] if values.get('familles') else questions.familles.default_value(individu_ids)
        if default_individu_id is not None:
            last_famille = familles[familles.keys()[-1]]
            if last_famille.get('parents') is None or default_individu_id not in last_famille['parents']:
                last_famille.setdefault('parents', []).append(default_individu_id)
        new_values['familles'] = familles

        # foyers fiscaux
        default_foyers_fiscaux = {
            uuidhelpers.generate_uuid(): {
                'declarants': [],
                'personnes_a_charge': [],
                },
            }
        foyers_fiscaux = values['foyers_fiscaux'] if values.get('foyers_fiscaux') else default_foyers_fiscaux
        last_foyer_fiscal = foyers_fiscaux[foyers_fiscaux.keys()[-1]]
        for individu_id in individu_ids:
            role_in_foyer_fiscal = guess_role_in_foyer_fiscal(individu_id)
            if role_in_foyer_fiscal is not None:
                last_foyer_fiscal.setdefault(role_in_foyer_fiscal, []).append(individu_id)
        new_values['foyers_fiscaux'] = foyers_fiscaux

        # ménages
        default_menages = {
            uuidhelpers.generate_uuid(): {
                'autres': [],
                'conjoint': None,
                'enfants': [],
                'personne_de_reference': None,
                },
            }
        menages = values['menages'] if values.get('menages') else default_menages
        last_menage = menages[menages.keys()[-1]]
        for individu_id in individu_ids:
            role_in_menage = guess_role_in_menage(individu_id)
            if role_in_menage is not None:
                if role_in_menage in menages_conv.singleton_roles:
                    last_menage[role_in_menage] = individu_id
                else:
                    last_menage.setdefault(role_in_menage, []).append(individu_id)
        new_values['menages'] = menages

        if values.get('year') is None:
            # FIXME Parametrize year.
            new_values['year'] = 2013

        return new_values, None
    return fill_user_api_data


input_to_uuid = pipe(
    cleanup_line,
    test(uuid_re.match, error = N_(u'Invalid UUID format')),
    )


input_to_words = pipe(
    input_to_slug,
    function(lambda slug: sorted(set(slug.split(u'-')))),
    empty_to_none,
    )


def korma_situation_data_to_api_data(values, state = None):
    if values is None:
        return None, None
    if state is None:
        state = default_state
    familles_api_data, errors = familles_conv.korma_data_to_api_data(values, state)
    if errors is not None:
        return values, errors
    foyers_fiscaux_api_data, errors = foyers_fiscaux_conv.korma_data_to_api_data({
        'foyers_fiscaux': values.get('foyers_fiscaux'),
        'individus': familles_api_data['individus'],
        }, state = state)
    if errors is not None:
        return values, errors
    menages_api_data, errors = menages_conv.korma_data_to_api_data({
        'individus': familles_api_data['individus'],
        'menages': values.get('menages'),
        }, state = state)
    if errors is not None:
        return values, errors
    return {
        'familles': familles_api_data['familles'],
        'foyers_fiscaux': foyers_fiscaux_api_data['foyers_fiscaux'],
        'individus': familles_api_data['individus'],
        'menages': menages_api_data['menages'],
        }, None


def method(method_name, *args, **kwargs):
    def method_converter(value, state = None):
        if value is None:
            return value, None
        return getattr(value, method_name)(state or default_state, *args, **kwargs)
    return method_converter


without_none_values = lambda mapping: dict((key, value) for key, value in mapping.iteritems() if value is not None)


# Level 2 converters

korma_data_to_api_data = pipe(
    function(lambda values: values.get('situation')),
    korma_situation_data_to_api_data,
    )
