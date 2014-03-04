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


from biryani1.baseconv import function, pipe, uniform_sequence
from biryani1.states import default_state


def scenarios_to_page_korma_data(scenarios, state = None):
    return {
        'my_scenarios': {
            'scenarios': [
                {'scenario': scenario}
                for scenario in scenarios or []
                ],
            },
        }, None


def korma_data_to_scenarios(values, state = None):
    if values is None:
        return None, None
    if state is None:
        state = default_state
    scenarios, error = pipe(
        function(lambda data: data.get(u'my_scenarios')),
        function(lambda data: data.get(u'scenarios')),
        uniform_sequence(
            function(lambda data: data.get('scenario')),
            ),
        )(values, state)
    if error is not None:
        return values, error
    if values.get('add'):
        scenarios.append({})
    return scenarios, None
