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


"""Korma questions and factories"""


import logging

from biryani1.baseconv import cleanup_line, pipe
from korma import helpers
from korma.base import Input
from korma.checkbox import Checkbox as KormaCheckbox
from korma.choice import Radio, Select
from korma.date import Date
from korma.group import Group
from korma.repeat import Repeat as KormaRepeat
from korma.text import Number, Text

from ..conv import base
from . import html


log = logging.getLogger(__name__)


Checkbox = lambda *args, **kwargs: \
    KormaCheckbox(
        inner_html_template = u'''
<div class="col-sm-offset-4 col-sm-8">
  <div class="checkbox">
    <label>{self.control_html} {self.label}</label>
  </div>
</div>''',
        *args, **kwargs)


class Hidden(Input):
    type = u'hidden'

    @property
    def control_attributes(self):
        return helpers.merge_mappings(
            super(Hidden, self).control_attributes,
            {u'value': self.value},
        )

    @property
    def default_input_to_data(self):
        return cleanup_line


class MongoDate(Date):
    @property
    def data_to_str(self):
        return pipe(base.datetime_to_date, super(MongoDate, self).data_to_str)

    @property
    def default_input_to_data(self):
        return pipe(super(MongoDate, self).default_input_to_data, base.date_to_datetime)


FrenchDate = lambda placeholder = u'dd/mm/yyyy', *args, **kwargs: \
    MongoDate(format=u'%d/%m/%Y', placeholder=placeholder, *args, **kwargs)


Repeat = lambda add_button_label = u'Ajouter', *args, **kwargs: \
    KormaRepeat(add_button_classes = u'add btn', add_button_label = add_button_label, javascript_add_button=False,
                *args, **kwargs)


def make_categories_groups(entity):
    from .. import model

    class PanelGroup(Group):
        @property
        def outer_html(self):
            return u'''
<div class="panel panel-default">
  <div class="panel-heading">
    <h4 class="panel-title">
      <a {link_class_attribute}data-toggle="collapse" data-parent="#accordion"
href="#collapse-{self.full_name_as_selector}" title="afficher / masquer">{self.label}</a>
    </h4>
  </div>
  <div id="collapse-{self.full_name}" class="panel-collapse collapse{collapse_in_class}">
    <div class="panel-body">
      <div class="form-horizontal">
        {self.questions_html}
      </div>
    </div>
  </div>
</div>'''.format(
                collapse_in_class = u' in' if self.name() == u'principal' else '',
                link_class_attribute = '' if self.name() == u'principal' else u'class="collapsed" ',
                self = self,
                )

    entity_categories = model.fields_api_data()['columns_tree'][entity]['children']
    categories_groups = []
    for entity_category in entity_categories:
        group_questions = []
        for column_name in entity_category['children']:
            column = model.fields_api_data()['columns'].get(column_name)
            if column is not None:
                question = make_question(column)
                if question is None:
                    log.error(u'Could not make question from column: {!r}'.format(column))
                else:
                    group_questions.append(question)
        categories_groups.append(
            PanelGroup(
                children_attributes = {
                    '_outer_html_template': html.bootstrap_group_outer_html_template,
                    },
                label = entity_category['label'],
                questions = group_questions,
                )
            )
    return categories_groups


def make_question(column):
    question_label = column.get('label')
    if column['@type'] == 'Boolean':
        return Checkbox(
            label = question_label,
            name = column['name'],
            value = column.get('default'),
            )
    elif column['@type'] == 'Enumeration':
        labels = column.get('labels', [])
        if len(labels) > 3:
            return Select(
                choices = column['labels'].iteritems(),
                label = question_label,
                name = column['name'],
                )
        elif len(labels) > 0:
            return Radio(
                choices = column['labels'].iteritems() if column.get('labels') else [],
                label = question_label,
                name = column['name'],
                )
        else:
            return Text(
                label = question_label,
                name = column['name'],
                )
    elif column['@type'] == 'Float':
        return Number(
            label = question_label,
            name = column['name'],
            step = 0.01,
            )
    elif column['@type'] == 'Integer':
        return Number(
            label = question_label,
            name = column['name'],
            step = 1,
            )
    elif column['@type'] == 'String':
        return Text(
            label = question_label,
            name = column['name'],
            )
    elif column['@type'] == 'Date':
        return FrenchDate(
            label = question_label,
            name = column['name'],
            )
