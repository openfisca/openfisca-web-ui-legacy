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


"""Conversion functions related to familles"""


from itertools import chain, groupby

from biryani1.baseconv import function, pipe, uniform_sequence


korma_data_to_page_api_data = pipe(
    function(lambda values: values.get('familles')),
    uniform_sequence(
        pipe(
            function(lambda values: values.get('personnes_in_famille')),
            pipe(
                uniform_sequence(
                    function(lambda values: values.get('personne_in_famille')),
                    ),
                function(
                    lambda values: [
                        (
                            famille_id,
                            {
                                role: map(lambda value: value['id'], individu)
                                for role, individu in groupby(individus, lambda value: value['role'])
                                }
                            )
                        for famille_id, individus in groupby(values, lambda value: value['famille_id'])
                        ]
                    ),
                ),
            ),
        ),
    function(lambda values: chain.from_iterable(values)),
    function(dict),
    )
