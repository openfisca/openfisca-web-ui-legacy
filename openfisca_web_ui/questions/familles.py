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
    return Repeat(
        add_button_label = u'Ajouter une famille',
        name = u'familles',
        template_question = Group(
            name = u'individus_and_categories',
            outer_html_template = u'<div class="repeated-group">{self.inner_html}</div>',
            questions = [
                Repeat(
                    add_button_label = u'Ajouter un membre',
                    name = u'individus',
                    template_question = Group(
                        name = u'individu',
                        outer_html_template = u'''
<h3>Famille {self.parent_data[individus][index]}</h3>
{self[famille_id].html}
<div class="form-inline personne-row">
  <a href="#" type="button" data-toggle="collapse" data-target="#individu"><span class="glyphicon
glyphicon-chevron-down"></span></a>
  {self[role].html} <span class="prenom">PRÉNOM</span>
</div>
<div id="individu" class="collapse in">
  <div class="form-horizontal">
    {self[categories].html}
  </div>
</div>''',
                        questions = [
                            Hidden(name = 'famille_id'),
                            Select(
                                control_attributes = {'class': 'form-control'},
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
<fieldset>
  <legend>Plus de précisions sur la famille</legend>
  <div class="form-horizontal">{self.inner_html}</div>
</fieldset>''',
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
