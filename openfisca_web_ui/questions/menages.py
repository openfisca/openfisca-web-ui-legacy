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


"""Korma questions related to menages"""


from korma.base import Button
from korma.choice import Select
from korma.group import Group
from korma.text import Number, Text

from .. import uuidhelpers
from . import html
from .base import Hidden, Repeat


def default_value(individu_ids, familles=None):
    parent_ids = []
    enfants_ids = []
    if familles is None:
        parent_ids = individu_ids
    else:
        for famille in familles.itervalues():
            if famille.get('parents'):
                parent_ids.extend(famille['parents'])
            if famille.get('enfants'):
                enfants_ids.extend(famille['enfants'])
    menage = {}
    for role in ['personne_de_reference', 'conjoint']:
        if len(parent_ids) > 0:
            menage[role] = parent_ids.pop()
    if len(parent_ids) > 0:
        menage['enfants'] = parent_ids
    if len(enfants_ids) > 0:
        menage.setdefault('enfants', []).extend(enfants_ids)
    return {uuidhelpers.generate_uuid(): menage}


make_menages_repeat = lambda prenom_select_choices: Repeat(
    children_attributes = {
        '_outer_html_template': u'''
<div class="repeated-group">
  {self.inner_html}
  <a class="btn btn-primary btn-all-question" href="/TODO/all-questions?entity=menages">Plus de détails</a>
</div>''',
        },
    name = 'menages',
    template_question = Group(
        children_attributes = {
            '_outer_html_template': html.bootstrap_group_outer_html_template,
            },
        name = 'menage',
        questions = [
            Select(
                control_attributes = {'class': 'form-control'},
                choices = [
                    u'Non renseigné',
                    u'Accédant à la propriété',
                    u'Propriétaire (non accédant) du logement',
                    u'Locataire d\'un logement HLM',
                    u'Locataire ou sous-locataire d\'un logement loué vide non-HLM',
                    u'Locataire ou sous-locataire d\'un logement loué meublé ou d\'une chambre d\'hôtel',
                    u'Logé gratuitement par des parents, des amis ou l\'employeur',
                    ],
                label = u'Statut d\'occupation',
                name = u'so',
                ),
            Number(
                control_attributes = {'class': 'form-control'},
                label = u'Loyer',
                step = 1,
                ),
            Text(
                control_attributes = {'class': 'form-control'},
                label = u'Localité',
                ),
            Repeat(
                name = u'personnes_in_menage',
                template_question = Group(
                    name = u'personne_in_menage',
                    outer_html_template = u'''
{self[menage_id].html}
<div class="form-inline personne-row">
  {self[role].html}
  {self[id].html}
  {self[edit].html}
</div>''',
                    questions = [
                        Hidden(name = 'menage_id'),
                        Select(
                            control_attributes = {'class': 'form-control'},
                            choices = (
                                (u'personne_de_reference', u'Personne de référence'),
                                (u'conjoint', u'Conjoint de la personne de référence'),
                                (u'enfants', u'Enfant de la personne de référence ou de son conjoint'),
                                (u'autres', u'Autre'),
                                ),
                            name = u'role',
                            ),
                        Select(
                            control_attributes = {'class': 'form-control'},
                            choices = prenom_select_choices,
                            name = 'id',
                            ),
                        Button(
                            label = u'Éditer',
                            name = u'edit',
                            outer_html_template = u'<button class="btn btn-primary" data-toggle="modal" type="button">\
{self.label}</button>',
                            ),
                        ],
                    ),
                ),
            ]
        ),
    )
