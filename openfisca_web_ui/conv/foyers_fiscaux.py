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

from biryani1.states import default_state

from .. import uuidhelpers


# Entity values

roles = ('declarants', 'personnes_a_charge')


# Helpers

extract_individu_ids = lambda values: list(chain.from_iterable(filter(None, [values.get(key) for key in roles])))


# Converters

def api_data_to_korma_data(values, state = None):
    from . import base
    if values is None:
        return None, None
    if state is None:
        state = default_state
    new_foyers_fiscaux = []
    if values.get('foyers_fiscaux') is not None:
        global roles
        individus = values.get('individus') or []
        for foyer_fiscal_id, foyer_fiscal in values['foyers_fiscaux'].iteritems():
            new_foyer_fiscal = {
                u'id': foyer_fiscal_id,
                u'individus': [],
                }
            for role in roles:
                if foyer_fiscal.get(role):
                    for individu_id in foyer_fiscal[role]:
                        if individu_id in individus:
                            new_individu = {
                                u'id': individu_id,
                                u'role': role,
                                }
                            new_foyer_fiscal['individus'].append({u'individu': new_individu})
            new_foyer_fiscal[u'categories'] = base.build_categories(
                columns = {key: value for key, value in foyer_fiscal.iteritems() if key not in roles},
                entity_name = u'foyers_fiscaux',
                )
            new_foyers_fiscaux.append({u'foyer_fiscal': new_foyer_fiscal})
    return {u'foyers_fiscaux': new_foyers_fiscaux or None}, None


def korma_data_to_api_data(values, state = None):
    if values is None:
        return None, None
    if state is None:
        state = default_state
    new_foyers_fiscaux = {}
    if values.get('foyers_fiscaux') is not None:
        individus = values.get('individus') or []
        for foyer_fiscal_group_values in values['foyers_fiscaux']:
            foyer_fiscal = foyer_fiscal_group_values['foyer_fiscal']
            new_foyer_fiscal_id = uuidhelpers.generate_uuid() if foyer_fiscal['id'] is None else foyer_fiscal['id']
            new_foyer_fiscal = {}
            if foyer_fiscal['categories'] is not None:
                for category in foyer_fiscal['categories'].itervalues():
                    new_foyer_fiscal.update(category)
            if foyer_fiscal['individus'] is not None:
                for individu_group_values in foyer_fiscal['individus']:
                    individu = individu_group_values['individu']
                    if individu['id'] in individus:
                        new_foyer_fiscal.setdefault(individu['role'], []).append(individu['id'])
            new_foyers_fiscaux[new_foyer_fiscal_id] = new_foyer_fiscal
    if values.get('add_foyer_fiscal'):
        new_foyer_fiscal_id = uuidhelpers.generate_uuid()
        new_foyers_fiscaux[new_foyer_fiscal_id] = {}
    return {u'foyers_fiscaux': new_foyers_fiscaux or None}, None
