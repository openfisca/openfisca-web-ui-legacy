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
import json
import re
import urllib2

from biryani1.baseconv import *  # NOQA
from biryani1.bsonconv import *  # NOQA
from biryani1.datetimeconv import *  # NOQA
from biryani1.objectconv import *  # NOQA
from biryani1.jsonconv import *  # NOQA
from biryani1.states import default_state, State  # NOQA


N_ = lambda message: message
uuid_re = re.compile(ur'[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$')


def data_to_simulation(data, state = None):
    from . import conf
    if data is None:
        return None, None
    if state is None:
        state = default_state

    request = urllib2.Request(conf['openfisca.api.url'], headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenFisca-Notebook',
        })
    try:
        response = urllib2.urlopen(request, json.dumps(data))
    except urllib2.HTTPError as http_exc:
        return data, state._('API respond with HTTP code {}').format(http_exc.code)
    except urllib2.URLError:
        return data, state._('API didn\'t respond')
    response_dict = json.loads(response.read(), object_pairs_hook = collections.OrderedDict)
    return response_dict, None


input_to_uuid = pipe(
    cleanup_line,
    test(uuid_re.match, error = N_(u'Invalid UUID format')),
    )


input_to_words = pipe(
    input_to_slug,
    function(lambda slug: sorted(set(slug.split(u'-')))),
    empty_to_none,
    )


#json_to_item_attributes = pipe(
#    test_isinstance(dict),
#    struct(
#        dict(
#            id = pipe(
#                input_to_object_id,
#                not_none,
#                ),
#            ),
#        default = noop,  # TODO(rsoufflet)
#        ),
#    rename_item('id', '_id'),
#    )


def method(method_name, *args, **kwargs):
    def method_converter(value, state = None):
        if value is None:
            return value, None
        return getattr(value, method_name)(state or default_state, *args, **kwargs)
    return method_converter


def user_data_to_api_data(user_data, state = None):
    if user_data is None:
        return None, None
    if state is None:
        state = default_state

    # TODO(rsoufflet) Ask for annual revenue. Annual revenu != "net mensuel * 12"
    inputs = {
        'maxrev': sum([person['person_data'].get('maxrev') * 12 for person in user_data.get('personnes') or []]),
        'nmen': 2,
        'scenarios': [{
            'indiv': [
                {
                    'birth': person['person_data'].get('birth'),
                    'noichef': 0,
                    'noidec': 0,
                    'noipref': 0,
                    }
                for person in user_data.get('personnes') or []
                ],
            'year': 2006,
            }],
        'x_axis': 'sali',
        }
    return inputs_to_api_data(inputs, state = state)


inputs_to_api_data = struct(
    {
        'maxrev': pipe(anything_to_int, default(14000)),
        'nmen': pipe(anything_to_int, default(3)),
        'scenarios': pipe(
            uniform_sequence(
                struct(
                    {
                        'declar': default({'0': {}}),
                        'famille': default({'0': {}}),
                        'indiv': uniform_sequence(
                            struct(
                                {
                                    'birth': function(lambda d: d.isoformat()),
                                    'noichef': pipe(anything_to_int, default(0)),
                                    'noidec': pipe(anything_to_int, default(0)),
                                    'noipref': pipe(anything_to_int, default(0)),
                                    'quifam': pipe(cleanup_line, default('chef')),
                                    'quifoy': pipe(cleanup_line, default('vous')),
                                    'quimen': pipe(cleanup_line, default('pref')),
                                    },
                                drop_none_values = False,
                                ),
                            ),
                        'menage': default({'0': {}}),
                        'year': pipe(
                            anything_to_int,
                            test_greater_or_equal(1950),
                            test_less_or_equal(2015),
                            ),
                        },
                    ),
                drop_none_items = True,
                ),
            test(lambda l: len(l) > 0),
            ),
        'x_axis': pipe(default('sali'), test_in(['sali'])),
        },
    )
