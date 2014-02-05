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


"""Conversion functions related to menages"""


from biryani1.baseconv import cleanup_line, function, noop, pipe, rename_item, struct, uniform_sequence


korma_data_to_page_api_data = pipe(
    function(lambda item: item.get('menages')),
    uniform_sequence(
        pipe(
            function(lambda item: item.get('menage')),
            struct(
                {
                    'localite': cleanup_line,
                    'loyer': noop,
                    'personnes_in_menage': uniform_sequence(function(lambda item: item.get('personne_in_menage'))),
                    'so': cleanup_line,
                    },
                default = noop,
                ),
            rename_item('menage_id', 'id'),
            ),
        ),
    )
