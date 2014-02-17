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


import datetime
import logging

from biryani1.baseconv import check, guess_bool, pipe
from korma.checkbox import Checkbox
from korma.choice import Radio, Select
from korma.date import Date
from korma.group import Group
from korma.repeat import Repeat as KormaRepeat
from korma.text import Number, Text

from ..conv import base


log = logging.getLogger(__name__)


bootstrap_form_group = u'<div class="form-group">{self.inner_html}</div>'


bootstrapize = lambda question_class, *args, **kwargs: \
    question_class(
        control_attributes = {'class': u'form-control'},
        *args, **kwargs)


BootstrapCheckbox = lambda *args, **kwargs: \
    Checkbox(
        inner_html_template = u'''
<div class="col-sm-offset-4 col-sm-8">
  <div class="checkbox">
    <label>{self.control_html} {self.label}</label>
  </div>
</div>''',
        *args, **kwargs)


BootstrapNumber = lambda *args, **kwargs: bootstrapize(Number, *args, **kwargs)


class BootstrapRadio(Radio):
    _inner_html_template = u'''
<label for="{self.full_name}">{self.label}</label>
<div>{self.control_html}</div>
'''

    def item_html(self, label, value):
        input_ = u'<input{attributes}>'.format(attributes=self.format_attributes(self.item_attributes(value)))
        return u'<label class="radio-inline">{input} {label}</label>'.format(input=input_, label=label)


BootstrapSelect = lambda *args, **kwargs: bootstrapize(Select, *args, **kwargs)


BootstrapText = lambda *args, **kwargs: bootstrapize(Text, *args, **kwargs)


custom_column_default_values = {
    u'birth': datetime.datetime(1984, 1, 1, 0, 0),
    }


class MongoDate(Date):
    @property
    def data_to_str(self):
        return pipe(base.datetime_to_date, super(MongoDate, self).data_to_str)

    @property
    def default_input_to_data(self):
        return pipe(super(MongoDate, self).default_input_to_data, base.date_to_datetime)


FrenchDate = lambda placeholder = u'jj/mm/aaaa', *args, **kwargs: \
    MongoDate(format=u'%d/%m/%Y', placeholder=placeholder, *args, **kwargs)


BootstrapFrenchDate = lambda *args, **kwargs: bootstrapize(FrenchDate, *args, **kwargs)


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
      {self.questions_html}
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
                children_attributes = {'_outer_html_template': bootstrap_form_group},
                label = entity_category['label'],
                questions = group_questions,
                )
            )
    return categories_groups


def make_question(column):
    default = column.get('default')
    if default is None:
        default = custom_column_default_values.get(column['name'])
    default_str = lambda question: check(question.data_to_str(default))
    question_label = column.get('label')
    if column['@type'] == 'Boolean':
        question = BootstrapRadio(
            choices = ((False, u'Non'), (True, u'Oui')),
            input_to_data = guess_bool,
            label = question_label,
            name = column['name'],
            )
    elif column['@type'] == 'Enumeration':
        labels = column.get('labels')
        if labels is not None:
            question = BootstrapSelect(
                add_first_empty_value = True,
                choices = column['labels'].iteritems(),
                label = question_label,
                name = column['name'],
                )
        else:
            question = BootstrapText(
                label = question_label,
                name = column['name'],
                )
            question.placeholder = default_str(question)
    elif column['@type'] == 'Float':
        question = BootstrapNumber(
            label = question_label,
            name = column['name'],
            )
        question.placeholder = default_str(question)
    elif column['@type'] == 'Integer':
        question = BootstrapNumber(
            label = question_label,
            name = column['name'],
            step = 1,
            )
        question.placeholder = default_str(question)
    elif column['@type'] == 'String':
        question = BootstrapText(
            label = question_label,
            name = column['name'],
            )
        question.placeholder = default_str(question)
    elif column['@type'] == 'Date':
        question = BootstrapFrenchDate(
            label = question_label,
            name = column['name'],
            )
        question.placeholder = default_str(question)
    return question
