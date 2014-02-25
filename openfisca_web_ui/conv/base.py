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

from . import familles, foyers_fiscaux, menages


N_ = lambda message: message
log = logging.getLogger(__name__)
uuid_re = re.compile(ur'[\da-f]{32}$')


api_data_to_korma_data = merge(
    familles.api_data_to_korma_data,
    foyers_fiscaux.api_data_to_korma_data,
    menages.api_data_to_korma_data,
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


def debug(value, state = None):
    from pprint import pprint
    pprint(value)
    return value, None


input_to_uuid = pipe(
    cleanup_line,
    test(uuid_re.match, error = N_(u'Invalid UUID format')),
    )


input_to_words = pipe(
    input_to_slug,
    function(lambda slug: sorted(set(slug.split(u'-')))),
    empty_to_none,
    )


korma_data_to_api_data = pipe(
    function(lambda values: values.get('situation')),
    merge(
        familles.korma_data_to_api_data,
        foyers_fiscaux.korma_data_to_api_data,
        menages.korma_data_to_api_data,
        ),
    )


def method(method_name, *args, **kwargs):
    def method_converter(value, state = None):
        if value is None:
            return value, None
        return getattr(value, method_name)(state or default_state, *args, **kwargs)
    return method_converter


without_none_values = lambda mapping: dict((key, value) for key, value in mapping.iteritems() if value is not None)
