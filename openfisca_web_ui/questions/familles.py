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


from korma.base import Hidden
from korma.choice import Select
from korma.group import Group

from .. import uuidhelpers
from . import base


def default_value(individu_ids):
    famille = {'parents': individu_ids[:2]}
    if len(individu_ids) > 2:
        famille['enfants'] = individu_ids[2:]
    return {uuidhelpers.generate_uuid(): famille}


def make_familles_repeat(prenom_select_choices):
    class FamilleGroup(Group):
        @property
        def outer_html(self):
            index = self.parent_data['familles']['index']
            return u'''
<div class="panel panel-primary">
  <div class="panel-heading">
    <h4 class="panel-title">
      <a data-toggle="collapse" data-parent="#accordion" href="#collapse-famille-{self[id].value}"
title="afficher / masquer">Famille {formatted_index}</a>
    </h4>
  </div>
  <div id="collapse-famille-{self[id].value}" class="panel-collapse collapse in">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>'''.format(formatted_index = index + 1, self = self)

    IndividuGroup = lambda *args, **kwargs: \
        Group(
            outer_html_template = u'''
{self[id].html}
<div class="panel panel-default">
  <div class="panel-heading">
    <div class="form-inline">
      <h4 class="panel-title">
        {self[role].html}
        <a data-toggle="collapse" data-parent="#accordion" href="#collapse-individu-{self[id].value}"
title="afficher / masquer">{self[categories][principal][prenom].value}</a>
      </h4>
    </div>
  </div>
  <div id="collapse-individu-{self[id].value}" class="panel-collapse collapse in">
    <div class="panel-body">
      <div class="form-horizontal">
        {self[categories].html}
      </div>
    </div>
  </div>
</div>''',
        *args, **kwargs)

    return base.Repeat(
        add_button_label = u'Ajouter une famille',
        count = 0,
        name = u'familles',
        template_question = FamilleGroup(
            name = u'famille',
            questions = [
                Hidden(name = 'id'),
                base.Repeat(
                    add_button_label = u'Ajouter un membre',
                    count = 0,
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
                                questions = base.make_categories_groups(entity=u'individus'),
                                ),
                            ],
                        ),
                    ),
                Group(
                    name = u'categories',
                    outer_html_template = u'''
<div class="panel panel-default">
  <div class="panel-heading">
    <h4 class="panel-title">
      <a class="collapsed" data-toggle="collapse" data-parent="#accordion"
href="#collapse-famille-{self.parent[id].value}-categories" title="affcher / masquer">Plus de précisions</a>
    </h4>
  </div>
  <div id="collapse-famille-{self.parent[id].value}-categories" class="panel-collapse collapse">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>''',
                    questions = base.make_categories_groups(entity=u'familles'),
                    ),
                ],
            ),
        )
