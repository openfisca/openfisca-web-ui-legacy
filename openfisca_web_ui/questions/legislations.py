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


"""Korma questions related to legislation URLs and simulation year"""


from korma.group import Group

from . import base


def make_legislations_repeat(simulations_id_and_name, legislations_id_and_name):
    class LegislationGroup(Group):
        @property
        def outer_html(self):
            index = self.parent_data['legislations']['index']
            return u'''
<div class="panel panel-primary">
  <div class="panel-heading panel-form">
    <h4 class="panel-title">
      <a href="#">Simulations et legislations</a>
    </h4>
  </div>
  <div class="panel-body">
    {self.inner_html}
  </div>
</div>'''.format(formatted_index = index + 1, self = self)

    return base.Repeat(
        add_button_label = u'Ajouter un scénario',
        name = u'legislations',
        template_question = LegislationGroup(
            children_attributes = {
                '_outer_html_template': u'<div class="form-group">{self.inner_html}</div>'
                },
            name = u'legislation',
            questions = [
                base.BootstrapFrenchDate(name = 'year', label = u'Année de simulation'),
                base.BootstrapSelect(
                    add_first_empty_value = True,
                    choices = simulations_id_and_name,
                    label = u'Simulation',
                    name = 'simulation',
                    ),
                base.BootstrapSelect(
                    add_first_empty_value = True,
                    choices = legislations_id_and_name,
                    label = u'Legislation',
                    name = 'legislation',
                    ),
                ],
            ),
        )
