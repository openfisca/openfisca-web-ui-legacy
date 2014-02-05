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


from itertools import chain

from biryani1.baseconv import cleanup_line, function, noop, pipe, rename_item, struct, test_in, uniform_sequence


korma_data_to_api_data = pipe(
    function(lambda item: item.get('familles')),
    uniform_sequence(
        pipe(
            function(lambda item: item.get('personnes')),
            uniform_sequence(
                pipe(
                    function(lambda item: item.get('personne_in_famille')),
                    struct(
                        {
                            'famille_id': cleanup_line,
                            'role': test_in(['parents', 'enfants']),
                            'prenom_condition': noop,
                            },
                        default = noop,
                        ),
                    rename_item('prenom_condition', 'personne'),
                    rename_item('famille_id', 'id'),
                    ),
                ),
            ),
        ),
    function(lambda lists: list(chain.from_iterable(lists))),
    )


#famille_korma_data_to_personnes = pipe(
#    function(lambda item: item.get('familles')),
#    uniform_sequence(
#        pipe(
#            function(lambda item: item.get('personnes')),
#            uniform_sequence(
#                pipe(
#                    function(lambda item: item.get('personne_in_famille', {}).get('prenom_condition')),
#                    rename_item('prenom', 'id'),
#                    ),
#                ),
#            ),
#        ),
#    function(lambda lists: list(chain.from_iterable(lists))),
#    )
