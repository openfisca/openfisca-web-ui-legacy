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


"""Korma questions related to individus"""


import datetime

from korma.choice import Select
from korma.group import Group
from korma.text import Number, Text

from .. import uuidhelpers
from . import html
from .base import FrenchDate


def build_prenom_select_choices(user_api_data):
    prenom_select_choices = []
    if user_api_data is not None:
        individus = user_api_data.get('individus')
        if individus is not None:
            for individu_id, individu in individus.iteritems():
                prenom_select_choices.append((individu_id, individu.get('prenom')))
    return prenom_select_choices


# TODO move to simulation.py?
default_values = {
    u'birth': datetime.datetime(1984, 1, 1, 0, 0),
    u'prenom': u'Personne 1',
    u'sali': 25000,
    u'statmarit': u'celibataire',
    }


def default_value():
    return {uuidhelpers.generate_uuid(): default_values}


group_questions = [
    Text(label = u'Prénom'),
    FrenchDate(
        label = u'Date de naissance',
        name = u'birth',
        ),
    Number(
        label = u'Salaire',
        min = 0,
        name = u'sali',
        step = 1,
        ),
    Select(
        choices = [
            u'Marié',
            u'Célibataire',
            u'Divorcé',
            u'Veuf',
            u'Pacsé',
            u'Jeune veuf',
            ],
        label = u'Statut marital',
        name = u'statmarit',
        ),
    ]


make_individu_group = lambda individu_id, prenom: Group(
    children_attributes = {
        '_control_attributes': {'class': 'form-control'},
        '_inner_html_template': html.horizontal_bootstrap_control_inner_html_template,
        '_outer_html_template': html.bootstrap_group_outer_html_template,
        },
    name = individu_id,
    outer_html_template = u'''
<div class="modal fade" id="{{self.full_name}}-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel">{prenom}</h4>
      </div>
      <div class="modal-body">
          <div class="form-horizontal">
            {{self[prenom].html}}
            {{self[birth].html}}
            {{self[sali].html}}
            {{self[statmarit].html}}
          </div>
      </div>
      <div class="modal-footer">
        <a class="btn btn-primary" href="/all-questions?entity=individus&id={individu_id}">Plus de détails</a>
        <button type="submit" class="btn btn-success">Valider</button>
      </div>
    </div>
  </div>
</div>'''.format(individu_id = individu_id, prenom = prenom),
    questions = group_questions,
    )
