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


from korma.base import Button
from korma.choice import Select
from korma.condition import Condition
from korma.group import Group
from korma.text import Number, Text

from . import html
from .base import FrenchDate


def build_prenom_select_choices(ctx):
    build_prenom_select_choices = []
    if ctx.session.user is not None:
        api_data = ctx.session.user.api_data
        if api_data is not None:
            api_personnes = api_data.get('individus')
            if api_personnes is not None:
                for api_personne_id, api_personne in api_personnes.iteritems():
                    build_prenom_select_choices.append((api_personne_id, api_personne.get('prenom')))
    build_prenom_select_choices.append(('new', u'Nouvelle personne'))
    return build_prenom_select_choices


make_personne_group = lambda personne_id, prenom: Group(
    children_attributes = {
        '_control_attributes': {'class': 'form-control'},
        '_inner_html_template': html.horizontal_bootstrap_control_inner_html_template,
        '_outer_html_template': html.bootstrap_group_outer_html_template,
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
          {{self[birth].html}}
          {{self[sali].html}}
          {{self[statmarit].html}}
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Fermer</button>
        <a class="btn btn-success" href="/all-questions?entity=individus&id={personne_id}">Plus de détails</a>
        <button type="submit" class="btn btn-primary">Valider</button>
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
        FrenchDate(
            label = u'Date de naissance',
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


make_prenoms_condition = lambda name, build_prenom_select_choices: Condition(
    base_question = Select(
        control_attributes = {'class': 'form-control'},
        choices = build_prenom_select_choices,
        name = 'id',
        ),
    conditional_questions = {
        personne_id: make_personne_group(personne_id, prenom)
        for personne_id, prenom in build_prenom_select_choices
        },
    name = name,
    )
