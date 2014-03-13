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


import collections

from korma.choice import Select
from korma.group import Group
from korma.repeat import Repeat
from korma.text import Hidden

from .. import conv, uuidhelpers
from . import base


def build_default_values(individu_ids):
    famille = {'parents': individu_ids[:2]}
    if len(individu_ids) > 2:
        famille['enfants'] = individu_ids[2:]
    return famille


def fill_values(values, ensure_api_compliance, individu_ids):
    familles = values
    if ensure_api_compliance and familles:
        familles = conv.base.without_none_values(familles)
    if not familles:
        familles = collections.OrderedDict([(uuidhelpers.generate_uuid(), build_default_values(individu_ids))])
    return familles


def make_familles_repeat():
    from .. import contexts

    class FamilleGroup(Group):
        @property
        def outer_html(self):
            index = self.parent_data['familles']['index']
            return u'''
<div class="panel panel-primary">
  <div class="panel-heading panel-form">
    <h4 class="panel-title">
      <a class="collapse-node-toggle" data-toggle="collapse" href="#collapse-famille-{self[id].value}" \
title="afficher / masquer">
        <span class="indicator"></span> Famille {formatted_index}
      </a>
    </h4>
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
  <div class="panel-heading panel-form">
    <div class="form-inline">
      <h4 class="panel-title">
        <a class="collapsed collapse-node-toggle" data-toggle="collapse" href="#collapse-individu-{self[id].value}" \
title="afficher / masquer">
          <span class="indicator"></span>
        </a>
        {self[role].html}
        <a class="x-editable" data-id="{self[id].value}" data-name="{self[categories][principal][prenom].full_name}" \
href="#" title="Modifier">
          {self[categories][principal][prenom].value}
        </a>
      </h4>
    </div>
  </div>
  <div id="collapse-individu-{self[id].value}" class="panel-collapse collapse">
    <div class="panel-body">
      {self[categories].html}
      {self[delete].html}
    </div>
  </div>
</div>'''.format(self = self)

    ctx = contexts.Ctx()

    return Repeat(
        name = u'familles',
        template_question = FamilleGroup(
            name = u'famille',
            questions = [
                Hidden(name = 'id'),
                Repeat(
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
                            base.BootstrapButton(
                                label = ctx._(u'Delete'),
                                name = 'delete',
                                other_classes = 'btn-default delete pull-right',
                                value = 'delete',
                                ),
                            ],
                        ),
                    ),
                base.BootstrapButton(
                    label = ctx._(u'Add a member'),
                    name = 'add',
                    other_classes = 'add btn-default',
                    value = 'add',
                    ),
                Group(
                    name = u'categories',
                    outer_html_template = u'''
<div class="panel panel-default">
  <div class="panel-heading panel-form">
    <h4 class="panel-title">
      <a class="collapse-node-toggle collapsed" data-toggle="collapse" \
href="#collapse-famille-{self.parent[id].value}-categories" title="affcher / masquer">
        <span class="indicator"></span> Plus de précisions
      </a>
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
                base.BootstrapButton(
                    label = ctx._(u'Delete'),
                    name = 'delete',
                    other_classes = 'btn-default',
                    value = 'delete',
                    ),
                ],
            ),
        )
