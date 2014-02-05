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


from biryani1.states import default_state

from .. import questions


def api_data_to_korma_data(api_data, state = None):
    # TODO split, having one converter by entity
    if api_data is None:
        return None, None
    if state is None:
        state = default_state
    korma_data = {
        'familles': [],
        'foyers_fiscaux': [],
        'menages': [],
        }
    if api_data.get('familles') is not None:
        for famille_id, famille in api_data['familles'].iteritems():
            personnes_in_famille = []
            for role in ['parents', 'enfants']:
                for idx, personne_id in enumerate(famille.get(role, [])):
                    personne_in_famille = {
                        'famille_id': famille_id,
                        'role': role,
                        }
                    personne_in_famille['prenom'] = famille[role][idx]
                    personnes_in_famille.append({'personne_in_famille': personne_in_famille})
            korma_data['familles'].append({'personnes_in_famille': personnes_in_famille})
    if api_data.get('foyers_fiscaux') is not None:
        for foyer_fiscal_id, foyer_fiscal in api_data['foyers_fiscaux'].iteritems():
            personnes_in_foyer_fiscal = []
            for role in ['declarants', 'personnes_a_charge']:
                for idx, personne_id in enumerate(foyer_fiscal.get(role, [])):
                    personne_in_foyer_fiscal = {
                        'foyer_fiscal_id': foyer_fiscal_id,
                        'role': role,
                        }
                    personne_in_foyer_fiscal['prenom'] = foyer_fiscal[role][idx]
                    personnes_in_foyer_fiscal.append({'personne_in_foyer_fiscal': personne_in_foyer_fiscal})
            korma_data['foyers_fiscaux'].append({'personnes_in_foyer_fiscal': personnes_in_foyer_fiscal})
    if api_data.get('menages') is not None:
        for menage_id, menage in api_data['menages'].iteritems():
            personnes_in_menage = []
            for role in ['personne_de_reference', 'conjoint']:
                personne_id = menage.get(role)
                if personne_id is None:
                    continue
                personne_in_menage = {
                    'menage_id': menage_id,
                    'role': role,
                    }
                personne_in_menage['prenom'] = menage[role]
                personnes_in_menage.append({'personne_in_menage': personne_in_menage})
            for role in ['enfants', 'autres']:
                for idx, personne_id in enumerate(menage.get(role, [])):
                    personne_in_menage = {
                        'menage_id': menage_id,
                        'role': role,
                        }
                    personne_in_menage['prenom'] = menage[role][idx]
                    personnes_in_menage.append({'personne_in_menage': personne_in_menage})
            korma_data['menages'].append({'personnes_in_menage': personnes_in_menage})
    return korma_data, None


def fill_user_api_data(values, state = None):
    """Compute missing values for API consistency and fill user API data with them."""
    if values is None:
        return None, None
    if state is None:
        state = default_state
    new_values = {}
    if values.get('individus') is None:
        new_values['individus'] = questions.individus.default_value()
    individu_ids = new_values['individus'].keys()
    if values.get('familles') is None:
        new_values['familles'] = questions.familles.default_value(individu_ids=individu_ids)
    if values.get('foyers_fiscaux') is None:
        new_values['foyers_fiscaux'] = questions.foyers_fiscaux.default_value(familles=new_values['familles'])
    if values.get('menages') is None:
        new_values['menages'] = questions.menages.default_value(familles=new_values['familles'],
                                                                individu_ids=individu_ids)
    return new_values, None


#def korma_data_to_api_data(korma_data, state = None):
#    if korma_data is None:
#        return None, None
#    if state is None:
#        state = default_state
#    new_person_id = uuidhelpers.generate_uuid()
#    new_famille_id = uuidhelpers.generate_uuid()
#    new_foyer_fiscal_id = uuidhelpers.generate_uuid()
#    new_logement_principal_id = uuidhelpers.generate_uuid()

#    api_data = state.session.user.api_data or {}
#    for korma_personne in korma_data['personnes']:
#        if korma_personne['id'] == 'new':
#            new_person_id = uuidhelpers.generate_uuid()
#            api_data.setdefault('individus', {})[new_person_id] = korma_personne[korma_personne['id']]
#            del api_data['individus'][new_person_id]['edit']
#        else:
#            api_data.setdefault('individus', {})[korma_personne['id']].update(korma_personne[korma_personne['id']])
#            del api_data['individus'][korma_personne['id']]['edit']
#    if korma_data.get('familles'):
#        for korma_famille in korma_data['familles']:
#            korma_famille_id = korma_famille['id'] or new_famille_id
#            personne_id = korma_famille['personne']['prenom'] \
#                if korma_famille['personne']['prenom'] != 'new' else new_person_id
#            for famille in api_data.get('familles', {}).itervalues():
#                for role in ['parents', 'enfants']:
#                    if personne_id in famille.get(role, []):
#                        famille[role].remove(personne_id)
#                        break
#            personnes = set(
#                api_data.setdefault('familles', {}).get(korma_famille_id, {}).get(korma_famille['role'], [])
#                )
#            personnes.add(personne_id)
#            api_data.setdefault('familles', {}).setdefault(korma_famille_id, {})[korma_famille['role']] = list(
#                personnes
#                )
#    if korma_data.get('declaration_impots'):
#        for korma_foyer_fiscal in korma_data['declaration_impots']:
#            korma_foyer_fiscal_id = korma_foyer_fiscal['id'] or new_foyer_fiscal_id
#            personne_id = korma_foyer_fiscal['personne']['prenom'] \
#                if korma_foyer_fiscal['personne']['prenom'] != 'new' else new_person_id
#            for declaration_impot in api_data.get('foyers_fiscaux', {}).itervalues():
#                for role in ['declarants', 'personnes_a_charge']:
#                    if personne_id in declaration_impot.get(role, []):
#                        declaration_impot[role].remove(personne_id)
#                        break
#            personnes = set(
#                api_data.setdefault('foyers_fiscaux', {}).get(korma_foyer_fiscal_id, {}).get(
#                    korma_foyer_fiscal['role'], [])
#                )
#            personnes.add(personne_id)
#            api_data.setdefault('foyers_fiscaux', {}).setdefault(
#                korma_foyer_fiscal_id,
#                {},
#                )[korma_foyer_fiscal['role']] = list(personnes)
#    if korma_data.get('logement_principal'):
#        for korma_logement_principal in korma_data['logement_principal']:
#            menage = dict(
#                (key, value)
#                for key, value in korma_logement_principal.iteritems()
#                if key not in ['personnes', 'localite']
#                )
#            for personne in korma_logement_principal.get('personnes'):
#                logement_principal_id = personne.get('logement_principal_id') or new_logement_principal_id
#                personne_id = new_person_id if personne['id'] == 'new' else personne['id']
#                for menage in api_data.get('menages', {}).itervalues():
#                    for role in ['conjoint', 'personne_de_reference']:
#                        if personne_id == menage.get(role):
#                            del menage[role]
#                            break
#                    for role in ['enfants', 'autres']:
#                        if personne_id in menage.get(role, []):
#                            menage[role].remove(personne_id)
#                            break
#                if personne['role'] in [u'conjoint', u'personne_de_reference']:
#                    menage[personne['role']] = personne_id
#                if personne['role'] in ['enfants', 'autres']:
#                    menage.setdefault(personne['role'], []).append(personne_id)
#            api_data.setdefault('menages', {}).setdefault(logement_principal_id, {}).update(menage)
#    return api_data, None
