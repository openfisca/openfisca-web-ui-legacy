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


"""Korma questions adapted to MongoDB"""


from korma.date import Date
from korma.text import Text
import openfisca_france.model.data

from . import conv


class MongoDate(Date):
    @property
    def data_to_str(self):
        return conv.pipe(conv.datetime_to_date, super(MongoDate, self).data_to_str)

    @property
    def default_input_to_data(self):
        return conv.pipe(super(MongoDate, self).default_input_to_data, conv.date_to_datetime)


def openfisca_france_column_data_to_questions(keep_entity = None):
    u'''keep_entities examples: "foy", "ind", "men"'''
    questions = []
    for name, column in openfisca_france.model.data.column_by_name.iteritems():
        if keep_entity is not None and column.entity != keep_entity:
            continue
        question = Text(
            label = conv.check(conv.decode_str()(column.label)),
            name = name,
            )
        questions.append(question)
    return questions
