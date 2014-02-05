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

from . import individus
from .base import Hidden, Repeat


def make_personne_in_famille_group(build_prenom_select_choices):
    return Group(
        name = u'personne_in_famille',
        outer_html_template = u'''
{self[famille_id].html}
<div class="form-inline personne-row">
  {self[role].html}
  {self[prenom_condition].html}
</div>
''',
        questions = [
            Hidden(name = 'famille_id'),
            Select(
                control_attributes = {'class': 'form-control'},
                choices = ((u'parents', u'Parent'), (u'enfants', u'Enfant')),
                name = u'role',
                ),
            individus.make_prenoms_condition(name = u'prenom_condition',
                                             build_prenom_select_choices = build_prenom_select_choices),
            ],
        )


make_familles_repeat = lambda build_prenom_select_choices: Repeat(
    add_button_label = u'Ajouter une famille',
    name = u'familles',
    template_question = Repeat(
        add_button_label = u'Ajouter un membre',
        name = u'personnes',
        outer_html_template = u'''
<div class="repeated-group">
  {self.inner_html}
  <a class="btn btn-primary btn-all-questions" href="/TODO/all-questions?entity=familles">Plus de détails</a>
</div>''',
        template_question = make_personne_in_famille_group(build_prenom_select_choices = build_prenom_select_choices),
        ),
    )
