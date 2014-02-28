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


"""Korma questions related to foyers fiscaux"""


from korma.choice import Select
from korma.group import Group
from korma.repeat import Repeat
from korma.text import Hidden

from . import base


def make_foyers_fiscaux_repeat(prenom_select_choices):
    from .. import conv

    class FoyerFiscalGroup(Group):
        @property
        def outer_html(self):
            index = self.parent_data['foyers_fiscaux']['index']
            return u'''
<div class="panel panel-primary">
  <div class="panel-heading panel-form">
    <h4 class="panel-title">
      <a class="collapse-node-toggle" data-toggle="collapse" href="#collapse-foyer-fiscal-{self[id].value}" \
title="afficher / masquer">
        <span class="indicator"></span> Déclaration d'impôts {formatted_index}
      </a>
    </h4>
  </div>
  <div id="collapse-foyer-fiscal-{self[id].value}" class="panel-collapse collapse in">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>'''.format(formatted_index = index + 1, self = self)

    return Repeat(
        count = 1,
        name = u'foyers_fiscaux',
        template_question = FoyerFiscalGroup(
            name = u'foyer_fiscal',
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
                                    (u'declarants', u'Déclarant'),
                                    (u'personnes_a_charge', u'Personne à charge'),
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
  <div class="panel-heading panel-form">
    <h4 class="panel-title">
      <a class="collapse-node-toggle collapsed" data-toggle="collapse" \
href="#collapse-foyer-fiscal-{self.parent[id].value}-categories" title="affcher / masquer">
        <span class="indicator"></span> Plus de précisions
      </a>
    </h4>
  </div>
  <div id="collapse-foyer-fiscal-{self.parent[id].value}-categories" class="panel-collapse collapse">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>''',
                    questions = base.make_categories_groups(entity=u'foyers_fiscaux'),
                    ),
                ],
            ),
        )
