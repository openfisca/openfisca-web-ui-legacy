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


from biryani1.states import default_state

from .. import uuidhelpers
from . import base


def api_data_to_page_korma_data(values, state = None):
    if values is None:
        return None, None
    if state is None:
        state = default_state
    new_menages = []
    if values.get('menages') is not None:
        roles = (u'personne_de_reference', u'conjoint', u'enfants', u'autres')
        for menage_id, menage in values['menages'].iteritems():
            new_menage = {
                u'id': menage_id,
                u'individus': [],
                }
            for role in roles:
                if menage.get(role) is not None:
                    for individu_id in menage[role]:
                        new_individu = {
                            u'id': individu_id,
                            u'role': role,
                            }
                        new_menage['individus'].append({u'individu': new_individu})
            columns = {key: value for key, value in menage.iteritems() if key not in roles}
            new_menage[u'categories'] = base.build_categories(columns = columns, entity_name = u'menages')
            new_menages.append({u'menage': new_menage})
    return {u'menages': new_menages}, None


def korma_data_to_page_api_data(values, state = None):
    if values is None:
        return None, None
    if state is None:
        state = default_state
    new_menages = {}
    for menage_group_values in values['menages']:
        menage = menage_group_values['menage']
        new_menage_id = uuidhelpers.generate_uuid() if menage['id'] is None else menage['id']
        new_menage = {}
        if menage['categories'] is not None:
            for category in menage['categories'].itervalues():
                new_menage.update(category)
        for individu_group_values in menage['individus']:
            individu = individu_group_values['individu']
            new_menage.setdefault(individu['role'], []).append(individu['id'])
        new_menages[new_menage_id] = new_menage
    if values.get('add'):
        new_menage_id = uuidhelpers.generate_uuid()
        new_menages[new_menage_id] = {}
    return {u'menages': new_menages}, None
