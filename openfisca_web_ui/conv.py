# -*- coding: utf-8 -*-


# OpenFisca -- A versatile microsimulation software
# By: OpenFisca Team <contact@openfisca.fr>
#
# Copyright (C) 2011, 2012, 2013, 2014, 2015 OpenFisca Team
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

from biryani.baseconv import *  # NOQA
from biryani.bsonconv import *  # NOQA
from biryani.datetimeconv import *  # NOQA
from biryani.objectconv import *  # NOQA
from biryani.jsonconv import *  # NOQA
from biryani.states import default_state


email_log = logging.getLogger('email')
uuid_re = re.compile(ur'[\da-f]{32}$')


def N_(message):
    return message


# Level 1 converters

def debug(value, state = None):
    from pprint import pprint
    pprint(value)
    return value, None


input_to_uuid_str = pipe(
    cleanup_line,
    test(uuid_re.match, error = N_(u'Invalid UUID format')),
    )


input_to_words = pipe(
    input_to_slug,
    function(lambda slug: sorted(set(slug.split(u'-')))),
    empty_to_none,
    )


def make_formatted_str_to_datetime(format):
    def formatted_str_to_date(value, state=None):
        if value is None:
            return None, None
        try:
            new_value = datetime.strptime(value, format)
        except ValueError as exc:
            error = unicode(exc)
            new_value = None
        else:
            error = None
        return new_value, error
    return formatted_str_to_date


def method(method_name, *args, **kwargs):
    def method_converter(value, state = None):
        if value is None:
            return value, None
        return getattr(value, method_name)(state or default_state, *args, **kwargs)
    return method_converter


# Level 2 converters

french_formatted_str_to_datetime = make_formatted_str_to_datetime(u'%d/%m/%y')
