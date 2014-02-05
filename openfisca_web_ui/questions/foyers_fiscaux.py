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

from . import individus
from .base import Hidden, Repeat


def make_personne_in_foyer_fiscal_group(prenom_select_choices):
    return Group(
        name = u'personne_in_foyer_fiscal',
        outer_html_template = u'''
{self[declaration_impot_id].html}
<div class="form-inline personne-row">
  {self[role].html}
  {self[prenom_condition].html}
</div>
''',
        questions = [
            Hidden(name = 'declaration_impot_id'),
            Select(
                control_attributes = {'class': 'form-control'},
                choices = (
                    (u'declarants', u'Déclarant'),
                    (u'declarants', u'Conjoint'),
                    (u'personnes_a_charge', u'Personne à charge'),
                    ),
                name = u'role',
                ),
            individus.make_prenoms_condition(name = u'prenom_condition',
                                             prenom_select_choices = prenom_select_choices),
            ],
        )


make_foyers_fiscaux_repeat = lambda prenom_select_choices: Repeat(
    name = u'declaration_impots',
    template_question = Repeat(
        name = u'personnes',
        outer_html_template = u'''
<div class="repeated-group">
  {self.inner_html}
  <a class="btn btn-primary btn-all-questions" href="/TODO/all-questions?entity=foyers_fiscaux">Plus de détails</a>
</div>''',
        template_question = make_personne_in_foyer_fiscal_group(
            prenom_select_choices = prenom_select_choices),
        ),
    )
