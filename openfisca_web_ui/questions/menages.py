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


from korma.base import Hidden
from korma.choice import Select
from korma.group import Group

from .. import uuidhelpers
from . import base


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


def make_menages_repeat(prenom_select_choices):
    class MenageGroup(Group):
        @property
        def outer_html(self):
            index = self.parent_data['menages']['index']
            return u'''
<div class="panel panel-primary">
  <div class="panel-heading">
    <h4 class="panel-title">
      <a data-toggle="collapse" data-parent="#accordion" href="#collapse-menage-{self[id].value}"
title="afficher / masquer">Logement principal {formatted_index}</a>
    </h4>
  </div>
  <div id="collapse-menage-{self[id].value}" class="panel-collapse collapse in">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>'''.format(formatted_index = index + 1, self = self)

    return base.Repeat(
        add_button_label = u'Ajouter un logement principal',
        name = u'menages',
        template_question = MenageGroup(
            name = u'menage',
            questions = [
                Hidden(name = 'id'),
                base.Repeat(
                    name = u'individus',
                    add_button_label = u'Ajouter un membre',
                    template_question = Group(
                        children_attributes = {
                            '_control_attributes': {'class': 'form-control'},
                            },
                        name = u'individu',
                        outer_html_template = u'<div class="form-inline"><p>{self.inner_html}</p></div>',
                        questions = [
                            Select(
                                choices = (
                                    (u'personne_de_reference', u'Personne de référence'),
                                    (u'conjoint', u'Conjoint de la personne de référence'),
                                    (u'enfants', u'Enfant de la personne de référence ou de son conjoint'),
                                    (u'autres', u'Autre'),
                                    ),
                                name = u'role',
                                ),
                            Select(
                                choices = prenom_select_choices,
                                name = 'id',
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
href="#collapse-menage-{self.parent[id].value}-categories" title="affcher / masquer">Plus de précisions</a>
    </h4>
  </div>
  <div id="collapse-menage-{self.parent[id].value}-categories" class="panel-collapse collapse">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>''',
                    questions = base.make_categories_groups(entity=u'menages'),
                    ),
                ],
            ),
        )
