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

from .. import uuidhelpers
from . import base


def default_value(familles):
    from .. import conv
    return {
        uuidhelpers.generate_uuid(): conv.base.without_none_values({
            'declarants': famille.get('parents'),
            'personnes_a_charge': famille.get('enfants'),
            })
        for famille_id, famille in familles.iteritems()
        }


def make_foyers_fiscaux_repeat(prenom_select_choices):
    class FoyerFiscalGroup(Group):
        @property
        def outer_html(self):
            index = self.parent_data['foyers_fiscaux']['index']
            return u'''
<div class="panel panel-primary">
  <div class="panel-heading">
    <h4 class="panel-title">
      <a data-toggle="collapse" data-parent="#accordion" href="#collapse-foyer-fiscal-{self[id].value}"
title="afficher / masquer">Déclaration d'impôts {formatted_index}</a>
    </h4>
  </div>
  <div id="collapse-foyer-fiscal-{self[id].value}" class="panel-collapse collapse in">
    <div class="panel-body">
      {self.inner_html}
    </div>
  </div>
</div>'''.format(formatted_index = index + 1, self = self)

    return base.Repeat(
        add_button_label = u'Ajouter une déclaration d\'impôts',
        name = u'foyers_fiscaux',
        template_question = FoyerFiscalGroup(
            name = u'foyer_fiscal',
            questions = [
                base.Hidden(name = 'id'),
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
                                    (u'declarants', u'Déclarant'),
                                    (u'personnes_a_charge', u'Personne à charge'),
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
href="#collapse-foyer-fiscal-{self.parent[id].value}-categories" title="affcher / masquer">Plus de précisions</a>
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
