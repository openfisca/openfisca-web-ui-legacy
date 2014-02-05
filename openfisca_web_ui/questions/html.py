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


"""HTML strings used to theme Korma questions"""


bootstrap_control_inner_html_template = u'''
<label class="control-label" for="{self.full_name}">{self.label}</label>
{self.control_html}'''


bootstrap_group_outer_html_template = u'<div class="form-group">{self.inner_html}</div>'


horizontal_bootstrap_control_inner_html_template = u'''
<label class="control-label col-sm-4" for="{self.full_name}">{self.label}</label>
<div class="col-sm-8">{self.control_html}</div>'''
