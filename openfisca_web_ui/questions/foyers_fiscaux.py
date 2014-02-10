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


from korma.base import Button
from korma.choice import Select
from korma.group import Group

from .. import uuidhelpers
from ..conv import base
from .base import Hidden, Repeat


def default_value(familles):
    return {
        uuidhelpers.generate_uuid(): base.without_none_values({
            'declarants': famille.get('parents'),
            'personnes_a_charge': famille.get('enfants'),
            })
        for famille_id, famille in familles.iteritems()
        }


make_foyers_fiscaux_repeat = lambda prenom_select_choices: Repeat(
    add_button_label = u'Ajouter une déclaration d\'impôts',
    name = u'foyers_fiscaux',
    template_question = Repeat(
        name = u'individus',
        template_question = Group(
            name = u'individu',
            questions = [
                Select(
                    control_attributes = {'class': 'form-control'},
                    choices = (
                        (u'declarants', u'Déclarant'),
                        (u'declarants', u'Conjoint'),
                        (u'personnes_a_charge', u'Personne à charge'),
                        ),
                    name = u'role',
                    ),
                Select(
                    control_attributes = {'class': 'form-control'},
                    choices = prenom_select_choices,
                    name = 'id',
                    ),
                ],
            ),
        ),
    )
