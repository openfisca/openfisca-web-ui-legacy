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


def make_legislation_urls_group(legislation_urls_and_descriptions):
    return Group(
        children_attributes = {'_outer_html_template': base.bootstrap_form_group},
        name = u'legislation_urls',
        outer_html_template = u'''
<div class="form-horizontal">
  {self.inner_html}
</div>''',
        questions = [
            base.BootstrapRadio(
                choices = legislation_urls_and_descriptions,
                label = u'URL de la législation',
                name = u'legislation_url',
                ),
            base.BootstrapNumber(
                label = u'Année de la simulation',
                name = 'year',
                step = 1,
                value = '2013',
                ),
            ],
        )
