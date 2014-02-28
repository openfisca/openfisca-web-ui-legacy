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


roles = (u'personne_de_reference', u'conjoint', u'enfants', u'autres')
singleton_roles = (u'personne_de_reference', u'conjoint')


def api_data_to_korma_data(values, state = None):
    from . import base
    if values is None:
        return None, None
    if state is None:
        state = default_state
    new_menages = []
    if values.get('menages') is not None:
        global roles, singleton_roles
        individus = values.get('individus') or []
        for menage_id, menage in values['menages'].iteritems():
            new_menage = {
                u'id': menage_id,
                u'individus': [],
                }
            for role in roles:
                individu_ids = None
                if role in singleton_roles:
                    if menage.get(role) is not None:
                        individu_ids = [menage[role]]
                else:
                    if menage.get(role):
                        individu_ids = menage[role]
                if individu_ids is not None:
                    for individu_id in individu_ids:
                        if individu_id in individus:
                            new_individu = {
                                u'id': individu_id,
                                u'role': role,
                                }
                            new_menage['individus'].append({u'individu': new_individu})
            new_menage[u'categories'] = base.build_categories(
                columns = {key: value for key, value in menage.iteritems() if key not in roles},
                entity_name = u'menages',
                )
            new_menages.append({u'menage': new_menage})
    return {u'menages': new_menages or None}, None


def korma_data_to_api_data(values, state = None):
    def add_to(new_menage, role, value):
        global singleton_roles
        if role in singleton_roles:
            if role in new_menage:
                return state._(u'This role is already set.')
            new_menage[role] = value
        else:
            new_menage.setdefault(role, []).append(value)
        return None

    if values is None:
        return None, None
    if state is None:
        state = default_state
    new_menages = {}
    if values.get('menages') is not None:
        individus = values.get('individus') or []
        for menage_group_values in values['menages']:
            menage = menage_group_values['menage']
            new_menage_id = uuidhelpers.generate_uuid() if menage['id'] is None else menage['id']
            new_menage = {}
            if menage['categories'] is not None:
                for category in menage['categories'].itervalues():
                    new_menage.update(category)
            if menage['individus'] is not None:
                for individu_group_values in menage['individus']:
                    individu = individu_group_values['individu']
                    if individu['id'] in individus:
                        error = add_to(new_menage = new_menage, role = individu['role'], value = individu['id'])
                        # TODO error must be structured following values hierarchy
                        if error is not None:
                            return values, error
            new_menages[new_menage_id] = new_menage
    if values.get('add'):
        new_menage_id = uuidhelpers.generate_uuid()
        new_menages[new_menage_id] = {}
    return {u'menages': new_menages or None}, None
