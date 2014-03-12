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


"""Korma questions related to Scenarios (Year, Legislation and Simuation)"""


from korma.group import Group
from korma.repeat import Repeat

from . import base


# TODO parametrize year
DEFAULT_YEAR = 2013


def make_scenarios_repeat(user):
    from .. import contexts, model

    test_cases_id_and_name = (
        (test_case._id, test_case.title)
        for test_case in user.test_cases
        )
    legislations_id_and_name = (
        (legislation._id, legislation.title)
        for legislation in model.Legislation.find()
        )

    ctx = contexts.Ctx()

    return Group(
        name = 'my_scenarios',
        questions = [
            Repeat(
                name = u'scenarios',
                template_question = Group(
                    children_attributes = {
                        '_outer_html_template': u'<div class="form-group">{self.inner_html}</div>',
                        },
                    name = u'scenario',
                    outer_html_template = u'<div class="scenario">{self.inner_html}</div>',
                    questions = [
                        base.BootstrapNumber(name = 'year', placeholder = unicode(DEFAULT_YEAR), step = 1),
                        base.BootstrapSelect(
                            add_first_empty_value = True,
                            choices = test_cases_id_and_name,
                            name = 'test_case_id',
                            ),
                        base.BootstrapSelect(
                            add_first_empty_value = True,
                            choices = legislations_id_and_name,
                            name = 'legislation_id',
                            ),
                        base.BootstrapButton(
                            label = ctx._(u'Delete'),
                            name = 'delete',
                            other_classes = 'btn-danger btn-sm',
                            value = 'delete',
                            ),
                        ],
                    ),
                ),
            base.BootstrapButton(
                label = ctx._(u'Add a new scenario'),
                other_classes = 'add btn-primary',
                name = 'add',
                value = 'add',
                ),
            ],
        )
