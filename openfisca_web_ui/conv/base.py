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

from .. import uuidhelpers
from . import familles as familles_conv
from . import foyers_fiscaux as foyers_fiscaux_conv
from . import menages as menages_conv


# FIXME Parametrize year.
DEFAULT_YEAR = 2013

N_ = lambda message: message
email_log = logging.getLogger('email')
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
            email_log.error(u'Unable to find category name from column_name: {!r} within entity: {!r}'.format(
                column_name, entity_name))
        else:
            categories.setdefault(category_name, {})[column_name] = column_value
    return categories


date_to_datetime = function(lambda value: datetime.datetime(*(value.timetuple()[:6])))


datetime_to_date = function(lambda value: value.date())


def make_fill_user_api_data(ensure_api_compliance):
    def fill_user_api_data(values, state = None):
        """Compute missing values for API consistency and fill user API data with them."""

        from .. import questions

        if values is None:
            return None, None
        if state is None:
            state = default_state

        new_values = {}

        # individus
        individu_values = values.get('individus')
        individus = individu_values if individu_values else {uuidhelpers.generate_uuid(): {u'prenom': u'Personne 1'}}
        new_values['individus'] = individus
        individu_ids = individus.keys()

        # familles
        familles = questions.familles.fill_values(
            ensure_api_compliance = ensure_api_compliance,
            individu_ids = individu_ids,
            values = values.get('familles'),
            )
        new_values['familles'] = familles

        # foyers fiscaux
        new_values['foyers_fiscaux'] = questions.foyers_fiscaux.fill_values(
            familles = familles,
            values = values.get('foyers_fiscaux'),
            )

        # ménages
        new_values['menages'] = questions.menages.fill_values(
            individu_ids = individu_ids,
            values = values.get('menages'),
            )

        if values.get('year') is None:
            new_values['year'] = DEFAULT_YEAR

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


without_keys = lambda excluded_keys, mapping: dict(
    (key, value)
    for key, value in mapping.iteritems()
    if key not in excluded_keys
)


without_none_values = lambda mapping: dict((key, value) for key, value in mapping.iteritems() if value is not None)


# Level 2 converters

korma_data_to_api_data = pipe(
    function(lambda values: values.get('situation')),
    korma_situation_data_to_api_data,
    )
