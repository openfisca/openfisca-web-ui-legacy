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


import collections

from korma.choice import Select
from korma.group import Group
from korma.repeat import Repeat
from korma.text import Hidden

from .. import conv, uuidhelpers
from . import base


def fill_values(values, individu_ids):
    menages = values or collections.OrderedDict([(uuidhelpers.generate_uuid(), {})])
    for individu_id in individu_ids:
        if find_menage_id(individu_id, menages) is None:
            menage = menages[menages.keys()[-1]]
            role = get_first_available_role_in_menage(menage)
            if role in conv.menages.singleton_roles:
                menage[role] = individu_id
            else:
                menage.setdefault(role, []).append(individu_id)
    return menages


def find_menage_id(individu_id, menages):
    """Find the menage containing the given individu."""
    for menage_id, menage in menages.iteritems():
        for menage_individu_id in conv.menages.extract_individu_ids(menage):
            if individu_id == menage_individu_id:
                return menage_id
    return None


def get_first_available_role_in_menage(menage):
    if menage.get('personne_de_reference') is None:
        return 'personne_de_reference'
    elif menage.get('conjoint') is None:
        return 'conjoint'
    else:
        return 'enfants'


def make_menages_repeat(prenom_select_choices):
    class MenageGroup(Group):
        @property
        def outer_html(self):
            index = self.parent_data['menages']['index']
            return u'''
<div class="panel panel-info">
  <div class="panel-heading">
    <h4 class="panel-title">
      <a class="collapse-node-toggle" data-toggle="collapse" href="#collapse-menage-{self[id].value}" \
title="afficher / masquer">
        <span class="indicator"></span> Logement principal {formatted_index}
      </a>
    </h4>
  </div>
  <div id="collapse-menage-{self[id].value}" class="panel-collapse collapse in">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>'''.format(formatted_index = index + 1, self = self)

    return Repeat(
        name = u'menages',
        template_question = MenageGroup(
            name = u'menage',
            questions = [
                Hidden(name = 'id'),
                Repeat(
                    name = u'individus',
                    template_question = Group(
                        children_attributes = {
                            '_control_attributes': {'class': 'form-control'},
                            },
                        name = u'individu',
                        outer_html_template = u'<div class="form-inline individu">{self.inner_html}</div>',
                        questions = [
                            Select(
                                choices = (
                                    (u'personne_de_reference', u'Personne de référence'),
                                    (u'conjoint', u'Conjoint de la personne de référence'),
                                    (u'enfants', u'Enfant de la personne de référence / conjoint'),
                                    (u'autres', u'Autre'),
                                    ),
                                name = u'role',
                                ),
                            Select(
                                choices = prenom_select_choices,
                                input_to_data = conv.base.input_to_uuid,
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
      <a class="collapse-node-toggle collapsed" data-toggle="collapse" \
href="#collapse-menage-{self.parent[id].value}-categories" title="affcher / masquer">
        <span class="indicator"></span> Plus de précisions
      </a>
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
