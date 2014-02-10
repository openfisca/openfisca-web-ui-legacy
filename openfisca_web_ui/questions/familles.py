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


"""Korma questions related to familles"""


from korma.choice import Select
from korma.group import Group

from .. import uuidhelpers
from .base import Hidden, Repeat


def default_value(individu_ids):
    famille = {'parents': individu_ids[:2]}
    if len(individu_ids) > 2:
        famille['enfants'] = individu_ids[2:]
    return {uuidhelpers.generate_uuid(): famille}


def make_familles_repeat(prenom_select_choices):
    from .. import model, questions

    class FamilleGroup(Group):
        @property
        def outer_html(self):
            index = self.parent_data['familles']['index']
            return u'''
<div class="panel panel-primary">
  <div class="panel-heading">
    <div class="panel-title">
      <a data-toggle="collapse" data-parent="#accordion" href="#collapse-famille-{self[id].value}"
title="afficher / masquer">Famille {formatted_index}</a>
    </div>
  </div>
  <div id="collapse-famille-{self[id].value}" class="panel-collapse collapse in">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>'''.format(formatted_index = index + 1, self = self)

    class IndividuGroup(Group):
        @property
        def outer_html(self):
            return u'''
{self[id].html}
<div class="panel panel-default">
  <div class="panel-heading">
    <div class="form-inline">
      <div class="panel-title">
        {self[role].html}
        <a data-toggle="collapse" data-parent="#accordion" href="#collapse-individu-{self[id].value}"
title="afficher / masquer">{prenom}</a>
      </div>
    </div>
  </div>
  <div id="collapse-individu-{self[id].value}" class="panel-collapse collapse">
    <div class="panel-body">
      <div class="form-horizontal">
        {self[categories].html}
      </div>
    </div>
  </div>
</div>'''.format(prenom = self['categories']['main']['prenom'].value or u'Prénom inconnu', self = self)

    return Repeat(
        add_button_label = u'Ajouter une famille',
        name = u'familles',
        template_question = FamilleGroup(
            name = u'famille',
            questions = [
                Hidden(name = 'id'),
                Repeat(
                    add_button_label = u'Ajouter un membre',
                    name = u'individus',
                    template_question = IndividuGroup(
                        name = u'individu',
                        questions = [
                            Hidden(name = 'id'),
                            Select(
                                control_attributes = {'class': 'form-control input-sm'},
                                choices = ((u'parents', u'Parent'), (u'enfants', u'Enfant')),
                                name = u'role',
                                ),
                            Group(
                                name = u'categories',
                                questions = [
                                    Group(
                                        children_attributes = {
                                            '_control_attributes': {'class': 'form-control'},
                                            '_inner_html_template': questions.html.
                                            horizontal_bootstrap_control_inner_html_template,
                                            '_outer_html_template': questions.html.bootstrap_group_outer_html_template,
                                            },
                                        name = u'main',
                                        questions = questions.individus.group_questions,
                                        ),
                                    ],
                                ),
                            ],
                        ),
                    ),
                Group(
                    name = u'categories',
                    outer_html_template = u'''
<div class="panel panel-default">
  <div class="panel-heading">
    <div class="panel-title">
      <a data-toggle="collapse" data-parent="#accordion" href="#collapse-categories" title="affcher / masquer">
        Plus de précisions sur la famille
      </a>
    </div>
  </div>
  <div id="collapse-categories" class="panel-collapse collapse">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>''',
                    questions = [
                        Group(
                            children_attributes = {
                                '_outer_html_template': questions.html.bootstrap_group_outer_html_template,
                                },
                            name = u'main',
                            questions = model.entity_questions(entity=u'familles'),
                            ),
                        ],
                    ),
                ],
            ),
        )
