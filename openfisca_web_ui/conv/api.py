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


"""Conversion functions related to API data"""


import copy
import datetime

from biryani1.baseconv import pipe
from biryani1.states import default_state

from .. import uuidhelpers


def api_data_to_korma_data(api_data, state = None):
    if api_data is None:
        return None, None
    if state is None:
        state = default_state
    if api_data.get('foyers_fiscaux') is None:
        api_data['foyers_fiscaux'] = {}
        for famille_id, famille in api_data.get('familles', {}).iteritems():
            api_data['foyers_fiscaux'][uuidhelpers.generate_uuid()] = {
                'declarants': famille.get('parents', []),
                'personnes_a_charge': famille.get('enfants', []),
                }
    korma_data = {
        'familles': [],
        'declaration_impots': [],
        'logements_principaux': [],
        }
    for famille_id, famille in api_data.get('familles', {}).iteritems():
        korma_famille = {
            'personnes': [],
            }
        for role in ['parents', 'enfants']:
            for idx, personne_id in enumerate(famille.get(role, [])):
                personne_in_famille = {
                    'famille_id': famille_id,
                    'prenom_condition': dict(api_data.get('individus', {}).iteritems()),
                    'role': role,
                    }
                personne_in_famille['prenom_condition']['prenom'] = famille[role][idx]
                korma_famille['personnes'].append({'personne_in_famille': personne_in_famille})
        korma_data['familles'].append(korma_famille)
    for declaration_impot_id, declaration_impot in api_data.get('foyers_fiscaux', {}).iteritems():
        korma_declaration_impot = {
            'personnes': [],
            }
        for role in ['declarants', 'personnes_a_charge']:
            for idx, personne_id in enumerate(declaration_impot.get(role, [])):
                personne_in_declaration_impots = {
                    'declaration_impot_id': declaration_impot_id,
                    'prenom_condition': dict(api_data.get('individus', {}).iteritems()),
                    'role': role,
                    }
                personne_in_declaration_impots['prenom_condition']['prenom'] = declaration_impot[role][idx]
                korma_declaration_impot['personnes'].append(
                    {'personne_in_declaration_impots': personne_in_declaration_impots}
                    )
        korma_data['declaration_impots'].append(korma_declaration_impot)
    for menage_id, menage in api_data.get('menages', {}).iteritems():
        korma_menage = dict(
            (key, value)
            for key, value in menage.iteritems()
            if key not in ['personne_de_reference', 'conjoint', 'enfants', 'autres']
            )
        korma_menage['personnes'] = []
        for role in ['personne_de_reference', 'conjoint']:
            personne_id = menage.get(role)
            if personne_id is None:
                continue
            personne_in_logement_principal = {
                'logement_principal_id': menage_id,
                'prenom_condition': dict(api_data.get('individus', {}).iteritems()),
                'role': role,
                }
            personne_in_logement_principal['prenom_condition']['prenom'] = menage[role]
            korma_menage['personnes'].append(
                {'personne_in_logement_principal': personne_in_logement_principal}
                )
        for role in ['enfants', 'autres']:
            for idx, personne_id in enumerate(menage.get(role, [])):
                personne_in_logement_principal = {
                    'logement_principal_id': menage_id,
                    'prenom_condition': dict(api_data.get('individus', {}).iteritems()),
                    'role': role,
                    }
                personne_in_logement_principal['prenom_condition']['prenom'] = menage[role][idx]
                korma_menage['personnes'].append(
                    {'personne_in_logement_principal': personne_in_logement_principal}
                    )
        korma_data.setdefault('logements_principaux', []).append({'logement_principal': korma_menage})
    return korma_data, None


def complete_api_data(api_data, state = None):
    if api_data is None:
        return None, None
    if state is None:
        state = default_state
    # Build artificially false "foyer fiscaux" and "menages"
    api_data = copy.deepcopy(api_data)
    if api_data.get('individus') is None:
        api_data['individus'] = {
            uuidhelpers.generate_uuid(): {
                u'birth': datetime.datetime(1984, 1, 1, 0, 0),
                u'prenom': u'Personne1',
                u'sali': 25000,
                u'statmarit': u'celibataire',
                }
            }
    if api_data.get('familles') is None:
        personne_ids = api_data.get('individus', {}).keys()
        famille = {'parents': [personne_ids.pop()]}
        if len(personne_ids) > 0:
            famille['parents'].append(personne_ids.pop())
        if len(personne_ids) > 0:
            famille['enfants'] = personne_ids
        api_data['familles'] = {uuidhelpers.generate_uuid(): famille}
    if api_data.get('foyers_fiscaux') is None:
        for famille_id, famille in api_data.get('familles').iteritems():
            api_data.setdefault('foyers_fiscaux', {})[uuidhelpers.generate_uuid()] = {
                'declarants': famille.get('parents', []),
                'personnes_a_charge': famille.get('enfants', []),
                }
    if api_data.get('menages') is None:
        parent_ids = []
        enfants_ids = []
        if api_data.get('familles') is not None:
            for famille in api_data['familles'].itervalues():
                parent_ids.extend(famille.get('parents', []))
                enfants_ids.extend(famille.get('enfants', []))
        else:
            parent_ids = api_data.get('individus').keys()
        menage = {}
        for role in ['personne_de_reference', 'conjoint']:
            if len(parent_ids) > 0:
                menage[role] = parent_ids.pop()
        if len(parent_ids) > 0:
            menage['enfants'] = parent_ids
        if len(enfants_ids) > 0:
            menage.setdefault('enfants', []).extend(enfants_ids)
        api_data['menages'] = {uuidhelpers.generate_uuid(): menage}
    return api_data, None


def korma_data_to_api_data(korma_data, state = None):
    if korma_data is None:
        return None, None
    if state is None:
        state = default_state
    new_person_id = uuidhelpers.generate_uuid()
    new_famille_id = uuidhelpers.generate_uuid()
    new_foyer_fiscal_id = uuidhelpers.generate_uuid()
    new_logement_principal_id = uuidhelpers.generate_uuid()

    api_data = state.session.user.api_data or {}
    for korma_personne in korma_data['personnes']:
        if korma_personne['id'] == 'new':
            new_person_id = uuidhelpers.generate_uuid()
            api_data.setdefault('individus', {})[new_person_id] = korma_personne[korma_personne['id']]
            del api_data['individus'][new_person_id]['edit']
        else:
            api_data.setdefault('individus', {})[korma_personne['id']].update(korma_personne[korma_personne['id']])
            del api_data['individus'][korma_personne['id']]['edit']
    if korma_data.get('familles'):
        for korma_famille in korma_data['familles']:
            korma_famille_id = korma_famille['id'] or new_famille_id
            personne_id = korma_famille['personne']['prenom'] \
                if korma_famille['personne']['prenom'] != 'new' else new_person_id
            for famille in api_data.get('familles', {}).itervalues():
                for role in ['parents', 'enfants']:
                    if personne_id in famille.get(role, []):
                        famille[role].remove(personne_id)
                        break
            personnes = set(
                api_data.setdefault('familles', {}).get(korma_famille_id, {}).get(korma_famille['role'], [])
                )
            personnes.add(personne_id)
            api_data.setdefault('familles', {}).setdefault(korma_famille_id, {})[korma_famille['role']] = list(
                personnes
                )
    if korma_data.get('declaration_impots'):
        for korma_foyer_fiscal in korma_data['declaration_impots']:
            korma_foyer_fiscal_id = korma_foyer_fiscal['id'] or new_foyer_fiscal_id
            personne_id = korma_foyer_fiscal['personne']['prenom'] \
                if korma_foyer_fiscal['personne']['prenom'] != 'new' else new_person_id
            for declaration_impot in api_data.get('foyers_fiscaux', {}).itervalues():
                for role in ['declarants', 'personnes_a_charge']:
                    if personne_id in declaration_impot.get(role, []):
                        declaration_impot[role].remove(personne_id)
                        break
            personnes = set(
                api_data.setdefault('foyers_fiscaux', {}).get(korma_foyer_fiscal_id, {}).get(
                    korma_foyer_fiscal['role'], [])
                )
            personnes.add(personne_id)
            api_data.setdefault('foyers_fiscaux', {}).setdefault(
                korma_foyer_fiscal_id,
                {},
                )[korma_foyer_fiscal['role']] = list(personnes)
    if korma_data.get('logement_principal'):
        for korma_logement_principal in korma_data['logement_principal']:
            menage = dict(
                (key, value)
                for key, value in korma_logement_principal.iteritems()
                if key not in ['personnes', 'localite']
                )
            for personne in korma_logement_principal.get('personnes'):
                logement_principal_id = personne.get('logement_principal_id') or new_logement_principal_id
                personne_id = new_person_id \
                    if personne['prenom_condition']['id'] == 'new' else personne['prenom_condition']['id']
                for menage in api_data.get('menages', {}).itervalues():
                    for role in ['conjoint', 'personne_de_reference']:
                        if personne_id == menage.get(role):
                            del menage[role]
                            break
                    for role in ['enfants', 'autres']:
                        if personne_id in menage.get(role, []):
                            menage[role].remove(personne_id)
                            break
                if personne['role'] in [u'conjoint', u'personne_de_reference']:
                    menage[personne['role']] = personne_id
                if personne['role'] in ['enfants', 'autres']:
                    menage.setdefault(personne['role'], []).append(personne_id)
            api_data.setdefault('menages', {}).setdefault(logement_principal_id, {}).update(menage)
    return api_data, None


user_api_data_to_korma_data = pipe(complete_api_data, api_data_to_korma_data)
