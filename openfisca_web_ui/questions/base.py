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

from biryani1.baseconv import check, guess_bool, pipe
from korma.base import Button
from korma.checkbox import Checkbox
from korma.choice import Radio, Select
from korma.date import Date
from korma.group import Group
from korma.text import Hidden, Number, Text

from ..conv import base


email_log = logging.getLogger('email')


bootstrap_form_group = u'<div class="form-group">{self.inner_html}</div>'


bootstrapize = lambda question_class, *args, **kwargs: \
    question_class(
        control_attributes = {'class': u'form-control'},
        *args, **kwargs)


def BootstrapButton(control_attributes = None, other_classes = None, *args, **kwargs):
    if control_attributes is None:
        control_attributes = {'class': 'btn btn-default', 'type': 'submit'}
    if other_classes is not None and control_attributes.get('class'):
        control_attributes['class'] += ' ' + other_classes
    return Button(control_attributes = control_attributes, *args, **kwargs)


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
    u'birth': 1984,
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


def make_categories_groups(entity):
    from .. import contexts, model

    ctx = contexts.Ctx()
    fields_api_data = model.fields_api_data()

    class ModalGroup(Group):
        _outer_html_template = u'''
<a href="#" class="list-group-item" data-toggle="modal" data-target="#modal-{self.full_name_as_selector}">
  {self.label}
</a>
<div class="modal fade" id="modal-{self.full_name}" tabindex="-1" role="dialog" \
aria-labelledby="modal-label-{self.full_name}" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="modal-label-{self.full_name}">{self.label}</h4>
      </div>
      <div class="modal-body">
        {self.questions_html}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">{self.messages[close]}</button>
        <button type="submit" class="btn btn-primary" data-dismiss="modal">{self.messages[validate]}</button>
      </div>
    </div>
  </div>
</div>'''
        messages = {
            u'close': ctx._(u'Close'),
            u'validate': ctx._(u'Validate'),
            }

    def build_category_questions(entity_category):
        category_questions = []
        for column_name in entity_category['children']:
            column = fields_api_data['columns'].get(column_name)
            if column is not None:
                # Transform prenom question into hidden for use with x-editable field.
                question = Hidden(name = column['name']) \
                    if entity == 'individus' and entity_category['label'] == u'Principal' \
                    and column['name'] == 'prenom' else make_question(column)
                if question is None:
                    email_log.error(u'Unable to make question from column: {!r}'.format(column))
                else:
                    category_questions.append(question)
        return category_questions

    entity_categories = fields_api_data['columns_tree'][entity]['children']
    categories_groups = []
    for entity_category in entity_categories:
        group_questions = build_category_questions(entity_category)
        if entity_category['label'] == u'Principal':
            category_group = Group(
                children_attributes = {'_outer_html_template': bootstrap_form_group},
                name = 'principal',
                outer_html_template = u'<div class="main-category">{self.inner_html}</div>',
                questions = group_questions,
                )
        else:
            category_group = ModalGroup(
                children_attributes = {'_outer_html_template': bootstrap_form_group},
                label = entity_category['label'],
                questions = group_questions,
                )
        categories_groups.append(category_group)
    return categories_groups


def make_question(column):
    default = column.get('default')
    if default is None:
        default = custom_column_default_values.get(column['name'])
    default_str = lambda question: check(question.data_to_str(default))
    question_label = column.get('label')
    cerfa_field = column.get('cerfa_field')
    if cerfa_field is not None and isinstance(cerfa_field, basestring):
        question_label += u' (CERFA {})'.format(cerfa_field)
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
            max = column.get('max'),
            min = column.get('min'),
            name = column['name'],
            )
        question.placeholder = default_str(question)
    elif column['@type'] == 'Integer':
        question = BootstrapNumber(
            label = question_label,
            max = column.get('max'),
            min = column.get('min'),
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


def make_situation_form(user_api_data):
    from . import familles, foyers_fiscaux, menages
    prenom_select_choices = [
        (individu_id, individu.get('prenom'))
        for individu_id, individu in user_api_data['individus'].iteritems()
        ] if user_api_data is not None and user_api_data.get('individus') is not None else None
    return Group(
        name = 'situation',
        outer_html_template = u'''
<ul class="nav nav-tabs">
    <li class="active"><a data-toggle="tab" href="#familles">Familles</a></li>
    <li><a data-toggle="tab" href="#foyers-fiscaux">Déclarations d'impôts</a></li>
    <li><a data-toggle="tab" href="#menages">Logements principaux</a></li>
</ul>
<div class="tab-content">
    <div class="tab-pane active" id="familles">
        {self[familles].html}
        {self[add_famille].html}
    </div>
    <div class="tab-pane" id="foyers-fiscaux">
        {self[foyers_fiscaux].html}
        {self[add_foyer_fiscal].html}
    </div>
    <div class="tab-pane" id="menages">
        {self[menages].html}
        {self[add_menage].html}
    </div>
</div>''',
        questions = [
            familles.make_familles_repeat(),
            BootstrapButton(
                label = u'Ajouter une famille',
                name = 'add_famille',
                other_classes = 'add',
                value = 1,
                ),
            foyers_fiscaux.make_foyers_fiscaux_repeat(prenom_select_choices),
            BootstrapButton(
                label = u'Ajouter un foyer fiscal',
                name = 'add_foyer_fiscal',
                other_classes = 'add',
                value = 1,
                ),
            menages.make_menages_repeat(prenom_select_choices),
            BootstrapButton(
                label = u'Ajouter un ménage',
                name = 'add_menage',
                other_classes = 'add',
                value = 1,
                ),
            ],
        )
