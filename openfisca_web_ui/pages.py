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


"""Pages meta-data"""


import datetime

from korma.base import Button
from korma.choice import Select
from korma.condition import Condition
from korma.date import Date
from korma.group import Group
from korma.text import Number, Text

from . import conv, questions


bootstrap_control_inner_html_template = u'''
<label class="control-label" for="{self.full_name}">{self.label}</label>
{self.control_html}'''


bootstrap_group_outer_html_template = u'<div class="form-group">{self.inner_html}</div>'


horizontal_bootstrap_control_inner_html_template = u'''
<label class="control-label col-sm-2" for="{self.full_name}">{self.label}</label>
<div class="col-sm-10">{self.control_html}</div>'''


make_prenoms_condition = lambda name, personnes_choices: Condition(
    base_question = Select(
        control_attributes = {'class': 'form-control'},
        choices = personnes_choices,
        name = 'prenom',
        ),
    conditional_questions = {
        personne_id: make_personne_group(personne_id, prenom)
        for personne_id, prenom in personnes_choices
        },
    name = name,
    )


make_personne_group = lambda personne_id, prenom: Group(
    children_attributes = {
        '_control_attributes': {'class': 'form-control'},
        '_inner_html_template': horizontal_bootstrap_control_inner_html_template,
        '_outer_html_template': bootstrap_group_outer_html_template,
        },
    name = personne_id,
    outer_html_template = u'''
{{self[edit].html}}
<div class="modal fade" id="{{self.full_name}}-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel">{prenom}</h4>
      </div>
      <div class="modal-body">
        <div class="form-horizontal">
          {{self[prenom].html}}
          {{self[sali].html}}
          {{self[statmarit].html}}
        </div>
      </div>
      <div class="modal-footer">
        <input class="btn btn-primary" type="submit" value="Valider">
      </div>
    </div>
  </div>
</div>'''.format(prenom = prenom, personne_id = personne_id),
    questions = [
        Button(
            label = u'Éditer',
            name = u'edit',
            outer_html_template = u'''
<button class="btn btn-primary" data-target="#{self.parent.full_name_as_selector}-modal" data-toggle="modal"
name="{self.full_name}" type="button">{self.label}</button>'''
            ),
        Text(label = u'Prénom'),
        Date(
            label = u'Date de naissance',
            max = datetime.datetime.now().date(),
            name = 'birth',
            ),
        Number(
            label = u'Salaire',
            min = 0,
            name = 'sali',
            step = 1,
            ),
        Select(
            choices = [
                u'Marié',
                u'Célibataire',
                u'Divorcé',
                u'Veuf',
                u'Pacsé',
                u'Jeune veuf',
                ],
            label = u'Statut marital',
            name = 'statmarit',
            ),
        ],
    )


def make_personne_in_declaration_impots_group(personnes_choices):
    return Group(
        name = u'personne_in_declaration_impots',
        outer_html_template = u'''
{self[declaration_impot_id].html}
<div class="form-inline personne-row">
  {self[role].html}
  {self[prenom_condition].html}
</div>
''',
        questions = [
            questions.Hidden(name = 'declaration_impot_id'),
            Select(
                control_attributes = {'class': 'form-control'},
                choices = (
                    (u'declarants', u'Déclarant'),
                    (u'declarants', u'Conjoint'),
                    (u'personnes_a_charge', u'Personne à charge'),
                    ),
                name = u'role',
                ),
            make_prenoms_condition(name = u'prenom_condition', personnes_choices = personnes_choices),
            ],
        )


def make_personne_in_famille_group(personnes_choices):
    return Group(
        name = u'personne_in_famille',
        outer_html_template = u'''
{self[famille_id].html}
<div class="form-inline personne-row">
  {self[role].html}
  {self[prenom_condition].html}
</div>
''',
        questions = [
            questions.Hidden(name = 'famille_id'),
            Select(
                control_attributes = {'class': 'form-control'},
                choices = ((u'parents', u'Parent'), (u'enfants', u'Enfant')),
                name = u'role',
                ),
            make_prenoms_condition(name = u'prenom_condition', personnes_choices = personnes_choices),
            ],
        )


def make_personne_in_logement_principal_group(personnes_choices):
    return Group(
        name = u'personne_in_logement_principal',
        outer_html_template = u'''
{self[logement_principal_id].html}
<div class="form-inline personne-row">
  {self[role].html}
  {self[prenom_condition].html}
</div>
''',
        questions = [
            questions.Hidden(name = 'logement_principal_id'),
            Select(
                control_attributes = {'class': 'form-control'},
                choices = (
                    (u'personne_de_référence', u'Personne de référence'),
                    (u'conjoint', u'Conjoint de la personne de référence'),
                    (u'enfant', u'Enfant de la personne de référence ou de son conjoint'),
                    (u'autre', u'Autre'),
                    ),
                name = u'role',
                ),
            make_prenoms_condition(name = u'prenom_condition', personnes_choices = personnes_choices),
            ],
        )


pages_data = [
    {
        'name': 'famille',
        'slug': 'famille',
        'title': u'Famille',
        'korma_data_to_personnes': conv.famille_korma_data_to_personnes,
        'korma_data_to_page_entities': conv.famille_korma_data_to_familles,
        'entities': 'familles',
        },
    {
        'name': 'declaration_impots',
        'slug': 'declaration-impots',
        'title': u'Déclaration d\'impôts',
        'korma_data_to_personnes': conv.declaration_impot_korma_data_to_personnes,
        'korma_data_to_page_entities': conv.declaration_impot_korma_data_to_declaration_impots,
        'entities': 'declaration_impots',
        },
    {
        'name': 'logement_principal',
        'slug': 'logement-principal',
        'title': u'Logement principal',
        'korma_data_to_personnes': conv.menage_korma_data_to_personnes,
        'korma_data_to_page_entities': conv.menage_korma_data_to_menages,
        'entities': 'logement_principal',
        },
    ]


def build_personnes_choices(ctx):
    personnes_choices = []
    if ctx.session.user is not None:
        api_data = ctx.session.user.api_data
        if api_data is not None:
            api_personnes = api_data.get('individus')
            if api_personnes is not None:
                for api_personne_id, api_personne in api_personnes.iteritems():
                    personnes_choices.append((api_personne_id, api_personne.get('prenom') or u'Inconnu'))
    personnes_choices.append(('new', u'Nouvelle personne'))
    return personnes_choices


def page_form(ctx, page_name):
    assert ctx.session is not None
    personnes_choices = build_personnes_choices(ctx)
    page_form_by_page_name = {
        'declaration_impots': questions.Repeat(
            name = u'declaration_impots',
            template_question = questions.Repeat(
                name = u'personnes',
                outer_html_template = u'''
<div class="repeated-group">
  {self.inner_html}
  <a class="btn btn-primary" href="/all-questions?entity=foy&idx={self.parent_data[declaration_impots][index]}">
    Plus de détails
  </a>
</div>''',
                template_question = make_personne_in_declaration_impots_group(personnes_choices=personnes_choices),
                ),
            ),
        'famille': questions.Repeat(
            name = u'familles',
            template_question = questions.Repeat(
                name = u'personnes',
                outer_html_template = u'''
<div class="repeated-group">
  {self.inner_html}
  <a class="btn btn-primary" href="/all-questions?entity=fam&idx={self.parent_data[familles][index]}">
    Plus de détails
  </a>
</div>''',
                template_question = make_personne_in_famille_group(personnes_choices=personnes_choices),
                ),
            ),
        'logement_principal': questions.Repeat(
            children_attributes = {
                '_outer_html_template': u'''
<div class="repeated-group">
  {self.inner_html}
  <a class="btn btn-primary" href="/all-questions?entity=men&idx={self.parent_data[logements_principaux][index]}">
    Plus de détails
  </a>
</div>''',
                },
            name = 'logements_principaux',
            template_question = Group(
                children_attributes = {
                    '_outer_html_template': bootstrap_group_outer_html_template,
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
                    questions.Repeat(
                        name = u'personnes',
                        template_question = make_personne_in_logement_principal_group(
                            personnes_choices=personnes_choices),
                        ),
                    ]
                ),
            ),
        }
    return page_form_by_page_name[page_name]
