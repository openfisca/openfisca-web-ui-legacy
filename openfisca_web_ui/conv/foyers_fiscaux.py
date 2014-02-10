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


"""Conversion functions related to foyers fiscaux"""


from itertools import chain

from biryani1.baseconv import function, pipe, rename_item, uniform_sequence


def api_data_to_page_korma_data(values, state = None):
    return {}, None


korma_data_to_page_api_data = pipe(
    function(lambda item: item.get('foyers_fiscaux')),
    uniform_sequence(
        pipe(
            function(lambda item: item.get('personnes_in_foyer_fiscal')),
            uniform_sequence(
                pipe(
                    function(lambda item: item.get('personne_in_foyer_fiscal')),
                    rename_item('foyer_fiscal_id', 'id'),
                    ),
                ),
            ),
        ),
    function(lambda lists: list(chain.from_iterable(lists))),
    )
