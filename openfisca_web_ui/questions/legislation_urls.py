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


"""Korma questions related to legislation URLs and year"""


from korma.choice import Radio
from korma.group import Group
from korma.text import Number


def make_legislation_urls_group(legislation_urls_and_descriptions):
    return Group(
        name = u'legislation_urls',
        outer_html_template = u'''
<div class="form-inline personne-row">
  {self[legislation_url].html}
  <br>
  {self[year].html}
</div>
''',
        questions = [
            Radio(
                control_attributes = {'class': 'form-control'},
                choices = legislation_urls_and_descriptions,
                name = u'legislation_url',
                ),
            Number(
                label = u'Année de la simulation',
                name = 'year',
                step = 1,
                value = '2013',
                ),
            ],
        )
