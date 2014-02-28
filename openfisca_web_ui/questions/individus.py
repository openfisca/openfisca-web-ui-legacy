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


"""Korma questions related to individus"""


from .. import uuidhelpers


def build_default_values(existing_individus_count = 0):
    return {u'prenom': u'Personne {}'.format(existing_individus_count + 1)}


def default_value():
    # TODO remove this function?
    return {uuidhelpers.generate_uuid(): build_default_values()}


def build_prenom_select_choices(user_api_data):
    prenom_select_choices = []
    if user_api_data is not None:
        individus = user_api_data.get('individus')
        if individus is not None:
            for individu_id, individu in individus.iteritems():
                prenom_select_choices.append((individu_id, individu.get('prenom')))
    return prenom_select_choices
