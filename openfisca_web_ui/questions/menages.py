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


from korma.choice import Select
from korma.group import Group
from korma.text import Number, Text

from . import html, individus
from .base import Hidden, Repeat


def make_personne_in_menage_group(build_prenom_select_choices):
    return Group(
        name = u'personne_in_menage',
        outer_html_template = u'''
{self[logement_principal_id].html}
<div class="form-inline personne-row">
  {self[role].html}
  {self[prenom_condition].html}
</div>
''',
        questions = [
            Hidden(name = 'logement_principal_id'),
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
            individus.make_prenoms_condition(name = u'prenom_condition',
                                             build_prenom_select_choices = build_prenom_select_choices),
            ],
        )


make_menages_repeat = lambda build_prenom_select_choices: Repeat(
    children_attributes = {
        '_outer_html_template': u'''
<div class="repeated-group">
  {self.inner_html}
  <a class="btn btn-primary btn-all-question" href="/TODO/all-questions?entity=menages">Plus de détails</a>
</div>''',
        },
    name = 'logements_principaux',
    template_question = Group(
        children_attributes = {
            '_outer_html_template': html.bootstrap_group_outer_html_template,
            },
        name = 'logement_principal',
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
                name = u'personnes',
                template_question = make_personne_in_menage_group(
                    build_prenom_select_choices = build_prenom_select_choices),
                ),
            ]
        ),
    )
